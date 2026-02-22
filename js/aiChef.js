/* ============================================
   aiChef.js — Master AI Chef Agent
   Phase 2: richer integration with all 4 sub-agents,
   emotion system, debug stats, creative suggestions
   ============================================ */

import { IngredientAgent } from './agents/ingredientAgent.js';
import { TimingAgent } from './agents/timingAgent.js';
import { StrategyAgent } from './agents/strategyAgent.js';
import { CreativityAgent } from './agents/creativityAgent.js';
import { SpeechBubble } from './utils.js';

const EMOTIONS = {
    HAPPY: 'happy',
    EXCITED: 'excited',
    WORRIED: 'worried',
    THINKING: 'thinking',
    PROUD: 'proud',
    ENCOURAGING: 'encouraging',
};

const EMOTION_EMOJIS = {
    happy: '😊',
    excited: '🤩',
    worried: '😟',
    thinking: '🤔',
    proud: '😁',
    encouraging: '💪',
};

export class AIChef {
    constructor(kitchen) {
        this.kitchen = kitchen;

        // Sub-agents
        this.ingredientAgent = new IngredientAgent();
        this.timingAgent = new TimingAgent();
        this.strategyAgent = new StrategyAgent();
        this.creativityAgent = new CreativityAgent();

        // State
        this.speechBubble = null;
        this.actionTimer = 0;
        this.actionInterval = 5; // seconds between AI actions
        this.currentStrategy = null;
        this.emotion = EMOTIONS.HAPPY;
        this.lastAdvice = '';
        this.thinkTimer = 0; // visual "thinking" indicator

        // Phase 2
        this.suggestedVariation = null;
        this.variationSuggested = false;
        this.lastTimingAdvice = null;
        this.timeSincePlayerAction = 0;

        // Visual Presence
        this.x = 900;
        this.y = 300;
        this.targetX = 900;
        this.targetY = 300;
    }

    render(ctx) {
        // Render Speech Bubble (Background)
        if (this.speechBubble) {
            this.speechBubble.render(ctx, this.x, this.y - 65);
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(0, 35, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chef Body (Simple Shape)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2D1B14';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hat
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-22, -45, 44, 25);
        ctx.strokeRect(-22, -45, 44, 25);
        ctx.beginPath();
        ctx.arc(0, -45, 22, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Face
        const emoji = EMOTION_EMOJIS[this.emotion] || '😊';
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 2);

        ctx.restore();
    }

    /** Say something in a speech bubble */
    say(text, duration = 3500) {
        this.speechBubble = new SpeechBubble(text, 140, 150, duration);
        this.lastAdvice = text;
    }

    /** Update emotion based on game state */
    _updateEmotion(recipeTracker) {
        if (!recipeTracker) {
            this.emotion = EMOTIONS.HAPPY;
            return;
        }

        if (recipeTracker.completed) {
            this.emotion = recipeTracker.mistakes === 0 ? EMOTIONS.PROUD : EMOTIONS.EXCITED;
        } else if (recipeTracker.streak >= 5) {
            this.emotion = EMOTIONS.EXCITED;
        } else if (recipeTracker.getRemaining() < 20) {
            this.emotion = EMOTIONS.WORRIED;
        } else if (recipeTracker.mistakes > 2) {
            this.emotion = EMOTIONS.ENCOURAGING;
        } else if (recipeTracker.getProgress() > 0.5) {
            this.emotion = EMOTIONS.HAPPY;
        } else {
            this.emotion = EMOTIONS.THINKING;
        }
    }

    /**
     * Main update tick
     */
    update(dt, recipeTracker) {
        // IDLE / FOLLOW Logic
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * 2 * dt;
        this.y += dy * 2 * dt;

        // Bobbing animation
        this.y += Math.sin(Date.now() / 300) * 0.2;

        // Update speech bubble
        if (this.speechBubble) {
            this.speechBubble.update(dt);
            if (!this.speechBubble.alive) this.speechBubble = null;
        }

        this.timeSincePlayerAction += dt;
        this._updateEmotion(recipeTracker);

        if (!recipeTracker || recipeTracker.completed || recipeTracker.failed) return;

        // Visual Thinking
        this.thinkTimer += dt;

        // Idle Hint System (User Requirement: 5s idle)
        if (this.timeSincePlayerAction > 5 && !this.speechBubble) {
            const step = recipeTracker.getCurrentStep();
            if (step) {
                // Suggest the next move
                let hint = `Try: ${step.description}`;
                if (step.action === 'pick') hint = `Drag the ${step.ingredient} to the ${step.stationId === 'cutting' ? 'Cutting Board' : step.stationId}`;
                if (step.action === 'chop') hint = "Click the CUT button!";
                if (step.action === 'cook') hint = "Click the COOK button!";
                if (step.action === 'mix') hint = "Click the MIX button!";
                if (step.action === 'plate') hint = "Drag it to the Plating Area!";

                this.say(`💡 ${hint}`, 4000);
                this.timeSincePlayerAction = 0; // Reset to avoid spam
            }
        }
    }

    /**
     * The AI Chef takes an action based on sub-agent decisions
     */
    _performAction(recipeTracker) {
        const step = recipeTracker.getCurrentStep();
        if (!step) return;

        // Strategy agent decides behavior
        const playerSkill = this._assessPlayerSkill(recipeTracker);
        const strategy = this.strategyAgent.decide(playerSkill, recipeTracker.getProgress(), recipeTracker.streak);
        this.currentStrategy = strategy;

        switch (strategy.mode) {
            case 'help':
            case 'teach':
                this._giveAdvice(recipeTracker, step, strategy);
                break;
            case 'compete':
                this._compete(recipeTracker, step, strategy);
                break;
            case 'cheer':
                this.say(strategy.message, 3000);
                break;
            case 'neutral':
            default:
                this._observe(recipeTracker, step, strategy);
                break;
        }
    }

    /** Give ingredient or timing advice */
    _giveAdvice(recipeTracker, step, strategy) {
        if (step.action === 'pick' && step.ingredient) {
            const msg = this.ingredientAgent.getRecommendationMessage(step, this.kitchen.getAvailableIngredients());
            this.say(msg || strategy.message, 3500);
        } else if (step.duration) {
            const timing = this.timingAgent.recommend(step, recipeTracker.recipe.name);
            this.lastTimingAdvice = timing;
            this.say(timing.message, 3500);
        } else {
            // Teaching tip from creativity agent
            const tip = this.creativityAgent.getCookingTip(step.action);
            this.say(tip || strategy.message, 3500);
        }
    }

    /** Compete mode — playful racing */
    _compete(recipeTracker, step, strategy) {
        this.say(strategy.message, 3000);
        // The AI "performs" the action faster (visual feedback only)
        this.actionInterval = Math.max(3, this.actionInterval - 0.3);
    }

    /** Observe mode — fun facts and casual chatter */
    _observe(recipeTracker, step, strategy) {
        // 50% chance fun fact vs. strategy message
        if (Math.random() < 0.3) {
            this.say(this.creativityAgent.getFunFact(), 5000);
        } else {
            this.say(strategy.message, 3000);
        }
    }

    /**
     * Assess player skill level based on recipe tracker
     */
    _assessPlayerSkill(recipeTracker) {
        const progress = recipeTracker.getProgress();
        const mistakes = recipeTracker.mistakes;
        const timeRatio = recipeTracker.getRemaining() / recipeTracker.recipe.timeLimit;

        if (mistakes > 3 || (progress < 0.2 && timeRatio < 0.5)) return 'struggling';
        if (mistakes === 0 && progress > 0.3 && timeRatio > 0.5) return 'advanced';
        return 'intermediate';
    }

    /**
     * Called when player successfully completes an action
     */
    onPlayerSuccess(recipeTracker, action, stationId, ingredientName) {
        this.timeSincePlayerAction = 0;

        // Train ingredient agent
        if (action === 'pick' && ingredientName) {
            const step = recipeTracker.recipe.steps[recipeTracker.currentStep - 1];
            if (step) {
                this.ingredientAgent.learn(step, ingredientName, true, this.kitchen.getAvailableIngredients());
            }
        }

        // Train timing agent on success
        if (action === 'cook' || action === 'mix' || action === 'chop') {
            const step = recipeTracker.recipe.steps[recipeTracker.currentStep - 1];
            if (step && step.duration) {
                this.timingAgent.learn(recipeTracker.recipe.name, step, 'perfect', true);
            }
        }

        // Train strategy
        const skill = this._assessPlayerSkill(recipeTracker);
        if (this.currentStrategy) {
            this.strategyAgent.learn(skill, recipeTracker.getProgress(), this.currentStrategy.mode, 1, recipeTracker.streak);
        }
    }

    /**
     * Called when player makes a mistake
     */
    onPlayerMistake(recipeTracker, action, stationId, ingredientName) {
        this.timeSincePlayerAction = 0;

        // Train ingredient agent on failure
        if (action === 'pick' && ingredientName) {
            const step = recipeTracker.getCurrentStep();
            if (step) {
                this.ingredientAgent.learn(step, ingredientName, false, this.kitchen.getAvailableIngredients());
            }
        }

        // Train strategy on negative engagement
        const skill = this._assessPlayerSkill(recipeTracker);
        if (this.currentStrategy) {
            this.strategyAgent.learn(skill, recipeTracker.getProgress(), this.currentStrategy.mode, -1, recipeTracker.streak);
        }
    }

    /**
     * Called at end of recipe round
     */
    onRecipeComplete(recipeTracker) {
        const skill = this._assessPlayerSkill(recipeTracker);
        this.strategyAgent.recordRound(skill, this.currentStrategy?.mode || 'neutral', 1, recipeTracker.score);

        // Suggest a creative variation for the completion screen
        if (!this.suggestedVariation) {
            this.suggestedVariation = this.creativityAgent.suggest(recipeTracker.recipe.name, this.kitchen.getAvailableIngredients());
        }

        // Apply variation bonus if suggested
        if (this.suggestedVariation && recipeTracker.completed) {
            recipeTracker.applyVariation(this.suggestedVariation);
            this.creativityAgent.learn(recipeTracker.recipe.name, this.suggestedVariation.suggestion, true);
        }

        // Post-round message
        const msg = this.strategyAgent.getPostRoundMessage(recipeTracker);
        this.say(msg, 5000);

        // Reset per-recipe state
        this.variationSuggested = false;
        this.suggestedVariation = null;
        this.actionInterval = 5;
    }

    /**
     * Render AI chef character + speech bubble
     */
    render(ctx) {
        const x = 80, y = 120;
        const bounce = Math.sin(Date.now() / 500) * 3;

        // Chef body
        ctx.font = '45px serif';
        ctx.textAlign = 'center';

        // Emotion-based emoji
        const emojiBody = EMOTION_EMOJIS[this.emotion] || '😊';
        ctx.fillText('👨‍🍳', x, y + 30 + bounce);

        // Emotion indicator (small floating emoji)
        ctx.font = '16px serif';
        ctx.globalAlpha = 0.8;
        ctx.fillText(emojiBody, x + 30, y - 5 + Math.sin(Date.now() / 300) * 2);
        ctx.globalAlpha = 1;

        // Thinking dots animation
        if (this.emotion === EMOTIONS.THINKING && !this.speechBubble) {
            const dots = '.'.repeat(1 + Math.floor((Date.now() / 400) % 3));
            ctx.font = '14px "Bubblegum Sans", cursive';
            ctx.fillStyle = '#B8895A';
            ctx.fillText(dots, x, y - 15);
        }

        // Speech bubble
        if (this.speechBubble) {
            this.speechBubble.render(ctx);
        }
    }

    /**
     * Get stats for all sub-agents (used by debug panel)
     */
    getStats() {
        return {
            ingredientAgent: this.ingredientAgent.getDetailedStats().qTable,
            timingAgent: this.timingAgent.getDetailedStats().qTable,
            strategyAgent: this.strategyAgent.getDetailedStats().qTable,
            creativityAgent: {
                ...this.creativityAgent.getDetailedStats().qTable,
                acceptanceRate: this.creativityAgent.getDetailedStats().acceptanceRate,
            },
        };
    }
}

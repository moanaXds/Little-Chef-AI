/* ============================================
   strategyAgent.js — Cooperate / Compete / Distract
   Phase 2: multi-round adaptation, engagement scoring,
   dynamic difficulty, richer personality
   ============================================ */

import { QTable, REWARDS } from '../qLearning.js';
import { randomChoice } from '../utils.js';

export const StrategyMode = {
    HELP: 'help',
    COMPETE: 'compete',
    NEUTRAL: 'neutral',
    CHEER: 'cheer',     // Phase 2: pure encouragement
    TEACH: 'teach',     // Phase 2: explain what to do
};

export class StrategyAgent {
    constructor() {
        this.qTable = new QTable({ alpha: 0.1, gamma: 0.85, epsilon: 0.35 });
        this.name = 'StrategyAgent';
        this.currentMode = StrategyMode.NEUTRAL;
        this.modeTimer = 0;

        // Phase 2: multi-round tracking
        this.roundHistory = [];  // { playerSkill, mode, engagement, score }
        this.totalRounds = 0;
        this.playerProfile = {
            avgMistakes: 0,
            avgSpeed: 0,
            preferredMode: null,
            improvementTrend: 0,  // positive = improving, negative = declining
        };
    }

    /**
     * Decide the AI Chef's strategy based on player skill + history
     */
    decide(playerSkillLevel, recipeProgress, streakCount = 0) {
        // Build a richer state from multi-round data
        const trend = this.playerProfile.improvementTrend > 0 ? 'improving' : 'steady';
        const state = `${playerSkillLevel}_p${Math.round(recipeProgress * 10) / 10}_${trend}_s${Math.min(5, streakCount)}`;
        const actions = [StrategyMode.HELP, StrategyMode.COMPETE, StrategyMode.NEUTRAL, StrategyMode.CHEER, StrategyMode.TEACH];
        const chosen = this.qTable.selectAction(state, actions);
        this.currentMode = chosen;

        const responses = {
            [StrategyMode.HELP]: {
                action: 'assist',
                messages: [
                    "🤗 Let me help you with this!",
                    "💪 Don't worry, I've got your back!",
                    "💡 Here's a hint for you!",
                    "😊 We'll do this together!",
                    "🌟 Let me show you how!",
                ],
            },
            [StrategyMode.COMPETE]: {
                action: 'race',
                messages: [
                    "🏃‍♂️ I bet I can finish faster!",
                    "🎯 Race you to the next step!",
                    "😜 Hehe, catch me if you can!",
                    "🚀 Can you keep up with me?",
                    "🏁 Let's see who plates first!",
                    "⚡ Speed cooking challenge!",
                ],
            },
            [StrategyMode.NEUTRAL]: {
                action: 'observe',
                messages: [
                    "👨‍🍳 Looking good, chef!",
                    "🤔 What should we cook next?",
                    "😄 The kitchen smells amazing!",
                    "✨ Nice technique!",
                    "🎶 Cooking is so much fun!",
                ],
            },
            [StrategyMode.CHEER]: {
                action: 'encourage',
                messages: [
                    "🎉 You're doing AMAZING!",
                    "⭐ Star chef in the making!",
                    "🥇 That was perfect!",
                    "🌟 You're getting better every time!",
                    "👏 Round of applause for you!",
                    "🎊 Keep that streak going!",
                ],
            },
            [StrategyMode.TEACH]: {
                action: 'explain',
                messages: [
                    "📚 Pro tip: follow the recipe steps!",
                    "🔍 Look at the recipe panel on the right!",
                    "💡 Drag ingredients to the right station!",
                    "📝 Click on stations when the step says to!",
                    "🎓 Great chefs take their time!",
                ],
            },
        };

        const resp = responses[chosen];
        return {
            mode: chosen,
            action: resp.action,
            message: randomChoice(resp.messages),
        };
    }

    /**
     * Learn from engagement and record round history
     */
    learn(playerSkillLevel, recipeProgress, mode, engagementScore, streakCount = 0) {
        const trend = this.playerProfile.improvementTrend > 0 ? 'improving' : 'steady';
        const state = `${playerSkillLevel}_p${Math.round(recipeProgress * 10) / 10}_${trend}_s${Math.min(5, streakCount)}`;
        const reward = engagementScore > 0 ? REWARDS.PLAYER_ENGAGED : REWARDS.WRONG_ACTION;
        const nextActions = [StrategyMode.HELP, StrategyMode.COMPETE, StrategyMode.NEUTRAL, StrategyMode.CHEER, StrategyMode.TEACH];
        this.qTable.update(state, mode, reward, state, nextActions);
    }

    /**
     * Record a completed round for multi-round adaptation
     */
    recordRound(playerSkill, mode, engagementScore, score) {
        this.roundHistory.push({ playerSkill, mode, engagement: engagementScore, score });
        this.totalRounds++;

        // Update player profile
        if (this.roundHistory.length >= 2) {
            const recent = this.roundHistory.slice(-3);
            const oldScores = this.roundHistory.slice(-6, -3).map(r => r.score);
            const newScores = recent.map(r => r.score);

            const oldAvg = oldScores.length > 0 ? oldScores.reduce((a, b) => a + b, 0) / oldScores.length : 0;
            const newAvg = newScores.reduce((a, b) => a + b, 0) / newScores.length;

            this.playerProfile.improvementTrend = newAvg - oldAvg;
        }

        // Find preferred mode
        const modeCounts = {};
        this.roundHistory.slice(-5).forEach(r => {
            modeCounts[r.mode] = (modeCounts[r.mode] || 0) + 1;
        });
        this.playerProfile.preferredMode = Object.entries(modeCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    }

    /**
     * Should the AI auto-complete a step for the player?
     */
    shouldAutoHelp(playerSkillLevel, timeSinceLastAction) {
        if (this.currentMode === StrategyMode.HELP && timeSinceLastAction > 8) return true;
        if (this.currentMode === StrategyMode.TEACH && timeSinceLastAction > 12) return true;
        if (playerSkillLevel === 'struggling' && timeSinceLastAction > 15) return true;
        return false;
    }

    /**
     * Get post-round message based on overall performance
     */
    getPostRoundMessage(recipeTracker) {
        if (recipeTracker.mistakes === 0 && recipeTracker.completed) {
            return randomChoice([
                "🌟 PERFECT round! You're a superstar chef!",
                "🏆 Flawless! I couldn't have done better!",
                "✨ No mistakes at all — incredible!",
            ]);
        }
        if (recipeTracker.completed) {
            return randomChoice([
                "🎉 Great job! We finished the recipe!",
                "👏 Nice cooking! Let's try another!",
                "😋 That looks delicious!",
            ]);
        }
        return randomChoice([
            "💪 Don't worry, practice makes perfect!",
            "🤗 We'll get it next time!",
            "📈 You're improving every round!",
        ]);
    }

    getDetailedStats() {
        return {
            qTable: this.qTable.getStats(),
            totalRounds: this.totalRounds,
            playerProfile: this.playerProfile,
            recentHistory: this.roundHistory.slice(-5),
        };
    }
}

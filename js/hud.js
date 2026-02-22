/* ============================================
   hud.js — Heads-Up Display
   Phase 2: tutorial overlay, high scores, paginated menu,
   streak display, debug panel, improved result screen
   ============================================ */

import { drawRoundRect, easeOutCubic, easeInOutQuad } from './utils.js';

export class HUD {
    constructor() {
        this.fadeIn = 0;
        this.notifications = [];
        this.starAnim = 0;
        this.shakeTimer = 0;
        this.comboScale = 1;

        // Phase 2
        this.showTutorial = false;
        this.tutorialStep = 0;
        this.tutorialOpacity = 0;
        this.menuPage = 0;        // pagination for 13 recipes
        this.recipesPerPage = 5;
        this.debugMode = false;
        this.streakDisplay = { count: 0, timer: 0 }; // flash streak on screen
    }

    update(dt) {
        if (this.fadeIn < 1) this.fadeIn = Math.min(1, this.fadeIn + dt * 2);
        this.starAnim += dt;

        this.notifications = this.notifications.filter(n => n.life > 0);
        this.notifications.forEach(n => {
            n.life -= dt;
            n.y -= dt * 20;
        });

        // Tutorial fade
        if (this.showTutorial) {
            this.tutorialOpacity = Math.min(1, this.tutorialOpacity + dt * 3);
        } else {
            this.tutorialOpacity = Math.max(0, this.tutorialOpacity - dt * 3);
        }

        // Streak display decay
        if (this.streakDisplay.timer > 0) {
            this.streakDisplay.timer -= dt;
        }
    }

    /** Flash a streak count on screen */
    showStreak(count) {
        this.streakDisplay.count = count;
        this.streakDisplay.timer = 1.5;
    }

    addNotification(text, x, y, color = '#FFD93D') {
        this.notifications.push({ text, x, y, color, life: 2.0 });
    }

    // =================================
    // Main gameplay HUD
    // =================================
    // =================================
    // Main gameplay HUD
    // =================================
    render(ctx, recipeTracker, score, aiChef, progressionManager) {
        if (!recipeTracker) return;

        ctx.save();
        ctx.globalAlpha = easeOutCubic(this.fadeIn);

        // Mistake shake effect
        if (this.shakeTimer > 0) {
            const intensity = 8 * this.shakeTimer;
            ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
        }

        this._renderRecipePanel(ctx, recipeTracker);
        this._renderTimerBar(ctx, recipeTracker);
        this._renderScore(ctx, score, progressionManager);
        this._renderCombo(ctx, score);
        this._renderStrategyBadge(ctx, aiChef);
        this._renderExitButton(ctx);
        this._renderStreakDisplay(ctx);
        this._renderNotifications(ctx);

        if (this.debugMode) this._renderDebugPanel(ctx, aiChef);

        ctx.restore();

        // Tutorial overlay
        if (this.tutorialOpacity > 0) this._renderTutorial(ctx);
    }

    _renderCombo(ctx, score) {
        if (!score || score.combo <= 1) return;

        ctx.save();
        ctx.font = 'bold 24px "Outfit", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Pulse effect
        const scale = 1 + Math.sin(Date.now() / 100) * 0.1;
        ctx.translate(200, 48); // Below score
        ctx.scale(scale, scale);

        const hue = (Date.now() / 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.strokeText(`COMBO x${score.combo}!`, 0, 0);
        ctx.fillText(`COMBO x${score.combo}!`, 0, 0);

        // Subtext
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText('ON FIRE!', 0, 20);

        ctx.restore();
    }

    // =================================
    // Recipe panel — top right
    // =================================
    _renderRecipePanel(ctx, tracker) {
        // Compact Layout: Fixed 280px width, max 200px height
        const w = 280;
        const h = 200;
        // Position: Top-Right (aligned to avoid stations)
        // User requested "100px from right edge", but that might overlap if stations are at Y=180.
        // Station Plate ends at 760+220 = 980? No, Plate X=708, W=160 -> Ends 868.
        // If Card X = 1024 - 100 - 280 = 644.
        // 644 overlaps Plate (708).
        // I will place it at Right Margin 20px (X = 724).
        // Wait, Plate is at 708. Card at 724 overlaps Plate.
        // "Recipe card bottom -> Plating Area top: minimum 80px gap".
        // Plating Area Y = 200.
        // Card Bottom must be < 120.
        // Card Height 200.
        // Impossible to be above Plating Area (Y=200) if Card spans 20-220.
        // Unless Plate is moved DOWN?
        // User said "Plating Area top: minimum 80px gap".
        // And "Stations... Y=200" (implied by alignment).
        // If Card is at Top-Right, it WILL overlap Plate if Plate is also Top-Right-ish.
        // Stations are: Cutting(156), Stove(340), Mixer(524), Plate(708).
        // Plate is at 708.
        // Card (280w) at 724 (Right aligned) is right on top of Plate.
        // User Fix 3: "Recipe card bottom -> Plating Area top: minimum 80px gap".
        // This implies Plate should be lower?
        // OR Card should be Left?
        // OR Card is "Top-Right" and Plate is "Bottom-Right"?
        // Stations are usually "on counter".
        // Maybe Card goes to the FAR Right (x=724) and Plate moves left? No, "aligned row".
        // Maybe Layout should be: Stations Lower?
        // "Stations... Y=200".
        // If I move Stations to Y=300?
        // Canvas H=640. Shelf Y=520.
        // Space 0-520.
        // If Stations at 300 (H=120) -> Bottom 420. Fits.
        // Then Card (H=200) at Y=20 -> Bottom 220.
        // Gap 220 -> 300 is 80px.
        // SOLUTION: Move Stations DOWN to Y=300.
        // I'll update Kitchen.js in next step to move stations to Y=300.
        // This tool call: Update HUD.

        const cardX = 1024 - w - 20;
        const cardY = 20;

        // Background
        drawRoundRect(ctx, cardX, cardY, w, h, 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Header
        ctx.font = 'bold 16px "Bubblegum Sans", cursive';
        ctx.fillStyle = '#FF6B6B';
        ctx.textAlign = 'left';
        ctx.fillText(`📋 ${tracker.recipe.name}`, cardX + 12, cardY + 24);

        // Progress Bar (Thin)
        const progress = tracker.getProgress();
        const barY = cardY + 34;
        drawRoundRect(ctx, cardX + 12, barY, w - 24, 4, 2);
        ctx.fillStyle = '#EEE';
        ctx.fill();
        if (progress > 0) {
            drawRoundRect(ctx, cardX + 12, barY, (w - 24) * progress, 4, 2);
            ctx.fillStyle = '#6BCB77';
            ctx.fill();
        }

        // Steps List
        const steps = tracker.recipe.steps;
        let startIndex = 0;
        if (tracker.currentStep > 2) {
            startIndex = Math.min(tracker.currentStep - 1, steps.length - 4);
        }
        startIndex = Math.max(0, startIndex);
        const visibleSteps = steps.slice(startIndex, startIndex + 4);

        const listY = barY + 12;

        visibleSteps.forEach((step, i) => {
            const absIndex = startIndex + i;
            const rowY = listY + i * 32;

            const isComplete = absIndex < tracker.currentStep;
            const isCurrent = absIndex === tracker.currentStep;

            // Highlight Current
            if (isCurrent) {
                const alpha = 0.1 + Math.abs(Math.sin(Date.now() / 400)) * 0.1;
                ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
                drawRoundRect(ctx, cardX + 8, rowY, w - 16, 28, 6);
                ctx.fill();
            }

            // Icon
            ctx.font = '14px serif';
            const icon = isComplete ? '✅' : (isCurrent ? '👉' : '○');
            ctx.fillStyle = isComplete ? '#AAA' : (isCurrent ? '#FF6B6B' : '#CCC');
            ctx.fillText(icon, cardX + 14, rowY + 18);

            // Text
            ctx.font = isCurrent ? 'bold 13px "Outfit", sans-serif' : '13px "Outfit", sans-serif';
            ctx.fillStyle = isComplete ? '#AAA' : (isCurrent ? '#3D2C2C' : '#888');
            ctx.textAlign = 'left';

            let text = step.description;
            if (text.length > 30) text = text.substring(0, 28) + '...';

            ctx.fillText(text, cardX + 36, rowY + 18);

            // Strikethrough
            if (isComplete) {
                const textWidth = ctx.measureText(text).width;
                ctx.beginPath();
                ctx.moveTo(cardX + 36, rowY + 12);
                ctx.lineTo(cardX + 36 + textWidth, rowY + 12);
                ctx.strokeStyle = '#AAA';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }

    // =================================
    // Timer bar — top center
    // =================================
    _renderTimerBar(ctx, tracker) {
        const remaining = tracker.getRemaining();
        const total = tracker.recipe.timeLimit;
        const fraction = remaining / total;
        // Top Center Alignment
        const w = 340, h = 32; // Larger, Pill Box
        const x = (1024 - w) / 2;
        const y = 16;

        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (fraction > 0) {
            drawRoundRect(ctx, x + 2, y + 2, (w - 4) * fraction, h - 4, 10);
            let color;
            if (fraction > 0.5) color = '#6BCB77';
            else if (fraction > 0.2) color = '#FFD93D';
            else color = '#FF6B6B';
            const grad = ctx.createLinearGradient(x, y, x + w * fraction, y);
            grad.addColorStop(0, color);
            grad.addColorStop(1, color + '99');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        ctx.font = 'bold 13px "Bubblegum Sans", cursive';
        ctx.fillStyle = fraction > 0.2 ? '#3D2C2C' : '#FF3333';
        ctx.textAlign = 'center';
        ctx.fillText(`⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`, x + w / 2, y + 17);

        // Low time warning pulse
        if (fraction < 0.15 && fraction > 0) {
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
            ctx.strokeStyle = '#FF3333';
            ctx.lineWidth = 3;
            drawRoundRect(ctx, x - 2, y - 2, w + 4, h + 4, 14);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    // =================================
    // Score — top left
    // =================================
    _renderScore(ctx, score, progressionManager) {
        // Top Right Alignment (beside Exit? No, Layout: Exit(L)-Timer-Score(R))
        const w = 170;
        const x = 1024 - w - 16;
        const y = 16;
        drawRoundRect(ctx, x, y, 170, 30, 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fill();

        const val = (score && typeof score === 'object') ? score.value : (score || 0);
        const stars = Math.min(5, Math.floor(val / 50));

        ctx.font = '14px serif';
        ctx.textAlign = 'left';
        for (let i = 0; i < 5; i++) {
            const bounce = i < stars ? Math.sin(this.starAnim * 3 + i) * 2 : 0;
            ctx.fillText(i < stars ? '⭐' : '☆', x + 8 + i * 18, y + 18 + bounce);
        }

        ctx.font = 'bold 13px "Bubblegum Sans", cursive';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`${val}pts`, x + 100, y + 21);

        // Player level badge
        if (progressionManager) {
            const lvl = progressionManager.getPlayerLevel();
            ctx.font = '10px "Outfit", sans-serif';
            ctx.fillStyle = '#4D96FF';
            ctx.fillText(`Lv.${lvl}`, x + 148, y + 21);
        }
    }

    // =================================
    // Strategy badge
    // =================================
    _renderStrategyBadge(ctx, aiChef) {
        if (!aiChef?.currentStrategy) return;
        const mode = aiChef.currentStrategy.mode;
        const badges = {
            help: { emoji: '🤝', label: 'Helping', color: '#6BCB77' },
            compete: { emoji: '🏁', label: 'Racing', color: '#4D96FF' },
            neutral: { emoji: '👀', label: 'Watching', color: '#FFD93D' },
            cheer: { emoji: '🎉', label: 'Cheering', color: '#FF9A9A' },
            teach: { emoji: '📚', label: 'Teaching', color: '#B088F9' },
        };
        const badge = badges[mode] || badges.neutral;
        const x = 12, y = 44;
        drawRoundRect(ctx, x, y, 110, 24, 10);
        ctx.fillStyle = badge.color + '22';
        ctx.fill();
        ctx.strokeStyle = badge.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = '12px "Bubblegum Sans", cursive';
        ctx.fillStyle = badge.color;
        ctx.textAlign = 'left';
        ctx.fillText(`${badge.emoji} AI: ${badge.label}`, x + 8, y + 17);
    }

    // =================================
    // Exit Button
    // =================================
    _renderExitButton(ctx) {
        // Redesigned Exit Button (Top-Left)
        const x = 16, y = 16, w = 120, h = 48;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        drawRoundRect(ctx, x + 4, y + 4, w, h, 12);
        ctx.fill();

        // Button Body
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#FF6B6B');
        grad.addColorStop(1, '#EE5253');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon & Text
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚪 EXIT', x + w / 2, y + h / 2 + 2);

        this._exitBtnRect = { x, y, w, h };
    }

    // =================================
    // Streak display — center flash
    // =================================
    _renderStreakDisplay(ctx) {
        if (this.streakDisplay.timer <= 0 || this.streakDisplay.count < 3) return;

        const alpha = Math.min(1, this.streakDisplay.timer);
        const scale = 1 + (1 - this.streakDisplay.timer / 1.5) * 0.3;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(512, 120);
        ctx.scale(scale, scale);
        ctx.font = 'bold 32px "Bubblegum Sans", cursive';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF6B6B';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 4;

        const text = this.streakDisplay.count >= 7 ? `🔥🔥🔥 ${this.streakDisplay.count}x STREAK!` :
            this.streakDisplay.count >= 5 ? `🔥🔥 ${this.streakDisplay.count}x Streak!` :
                `🔥 ${this.streakDisplay.count}x Streak!`;
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    // =================================
    // Floating notifications
    // =================================
    _renderNotifications(ctx) {
        this.notifications.forEach(n => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, n.life / 2);
            ctx.font = 'bold 16px "Bubblegum Sans", cursive';
            ctx.fillStyle = n.color;
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.strokeText(n.text, n.x, n.y);
            ctx.fillText(n.text, n.x, n.y);
            ctx.restore();
        });
    }

    // =================================
    // Debug panel — AI decision visualization
    // =================================
    _renderDebugPanel(ctx, aiChef) {
        if (!aiChef) return;
        const x = 12, y = 350, w = 250, h = 80;
        drawRoundRect(ctx, x, y, w, h, 10);
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fill();

        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.fillStyle = '#6BCB77';
        ctx.textAlign = 'left';
        ctx.fillText('🔧 DEBUG — AI Agent Decisions', x + 8, y + 14);

        ctx.font = '9px "Outfit", sans-serif';
        ctx.fillStyle = '#CCC';
        const stats = aiChef.getStats();
        ctx.fillText(`Ingredient ε: ${stats.ingredientAgent.epsilon.toFixed(3)} | updates: ${stats.ingredientAgent.updateCount}`, x + 8, y + 28);
        ctx.fillText(`Timing ε: ${stats.timingAgent.epsilon.toFixed(3)} | updates: ${stats.timingAgent.updateCount}`, x + 8, y + 40);
        ctx.fillText(`Strategy ε: ${stats.strategyAgent.epsilon.toFixed(3)} | updates: ${stats.strategyAgent.updateCount}`, x + 8, y + 52);
        ctx.fillText(`Creativity ε: ${stats.creativityAgent.epsilon.toFixed(3)} | accept: ${stats.creativityAgent.acceptanceRate || '0%'}`, x + 8, y + 64);
        ctx.fillText(`Mode: ${aiChef.currentStrategy?.mode || 'N/A'} | Emotion: ${aiChef.emotion}`, x + 8, y + 76);
    }

    // =================================
    // Tutorial overlay
    // =================================
    _renderTutorial(ctx) {
        ctx.save();
        ctx.globalAlpha = this.tutorialOpacity;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, 1024, 640);

        const steps = [
            { text: '👆 Drag ingredients from the shelf to cooking stations!', x: 512, y: 480, arrow: 'down' },
            { text: '🔪 Click stations when a recipe step needs chopping, mixing, or cooking!', x: 400, y: 260, arrow: 'right' },
            { text: '📋 Follow the recipe steps in the panel on the right!', x: 700, y: 100, arrow: 'left' },
            { text: '🤖 Your AI Chef will help, compete, and learn as you cook!', x: 512, y: 320, arrow: null },
        ];

        const step = steps[this.tutorialStep] || steps[0];

        // Highlight bubble
        drawRoundRect(ctx, step.x - 180, step.y - 25, 360, 50, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
        ctx.strokeStyle = '#FFD93D';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 14px "Bubblegum Sans", cursive';
        ctx.fillStyle = '#3D2C2C';
        ctx.textAlign = 'center';
        ctx.fillText(step.text, step.x, step.y + 5);

        // Navigation
        ctx.font = '13px "Outfit", sans-serif';
        ctx.fillStyle = '#FFD93D';
        const navY = 580;
        ctx.fillText(`Step ${this.tutorialStep + 1} / ${steps.length}`, 512, navY);
        ctx.fillText('Click anywhere to continue →', 512, navY + 20);

        // Store click area for tutorial navigation
        this._tutorialClickArea = { x: 0, y: 0, w: 1024, h: 640 };

        ctx.restore();
    }

    /** Advance tutorial step, returns true if tutorial is done */
    advanceTutorial() {
        this.tutorialStep++;
        if (this.tutorialStep >= 4) {
            this.showTutorial = false;
            this.tutorialStep = 0;
            return true;
        }
        return false;
    }

    // =================================
    // Menu screen — paginated for 13 recipes
    // =================================
    renderMenu(ctx, recipes, canvasW, canvasH, progressionManager) {
        ctx.fillStyle = 'rgba(255, 248, 240, 0.97)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Title
        ctx.font = 'bold 42px "Bubblegum Sans", cursive';
        ctx.fillStyle = '#FF6B6B';
        ctx.textAlign = 'center';
        ctx.fillText('👨‍🍳 Little Chef AI', canvasW / 2, 60);

        ctx.font = '15px "Outfit", sans-serif';
        ctx.fillStyle = '#7A6363';
        ctx.fillText('Choose a recipe to cook together!', canvasW / 2, 88);

        // Player level & stats
        if (progressionManager) {
            const lvl = progressionManager.getPlayerLevel();
            const rounds = progressionManager.getTotalRounds();
            ctx.font = '13px "Outfit", sans-serif';
            ctx.fillStyle = '#4D96FF';
            ctx.fillText(`⭐ Level ${lvl} Chef | 🍳 ${rounds} rounds played`, canvasW / 2, 108);
        }

        // Paginated recipe cards
        const pageRecipes = recipes.slice(
            this.menuPage * this.recipesPerPage,
            (this.menuPage + 1) * this.recipesPerPage
        );
        const totalPages = Math.ceil(recipes.length / this.recipesPerPage);

        const cardW = 170, cardH = 190, gap = 16;
        const totalW = pageRecipes.length * cardW + (pageRecipes.length - 1) * gap;
        const startX = (canvasW - totalW) / 2;
        const cardY = 128;

        const emojis = {
            'Pancakes': '🥞', 'Fruit Salad': '🥗', 'Smoothie': '🥤', 'Lemonade': '🍋',
            'Chocolate Cookie': '🍪', 'Pasta Marinara': '🍝', 'Omelette': '🍳', 'Grilled Cheese': '🧀',
            'PB&J Sandwich': '🥪', 'Fried Rice': '🍚', 'Bruschetta': '🍅', 'Berry Parfait': '🫐',
            'Banana Split': '🍌'
        };

        pageRecipes.forEach((recipe, i) => {
            const cx = startX + i * (cardW + gap);

            // Shadow
            drawRoundRect(ctx, cx + 3, cardY + 3, cardW, cardH, 16);
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fill();

            // Card
            drawRoundRect(ctx, cx, cardY, cardW, cardH, 16);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = '#FFE0CC';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Emoji
            const baseName = recipe.name.replace(/\s*[^\x00-\x7F]+/g, '').trim();
            ctx.font = '40px serif';
            ctx.textAlign = 'center';
            ctx.fillText(emojis[baseName] || '🍽️', cx + cardW / 2, cardY + 50);

            // Name
            ctx.font = 'bold 13px "Bubblegum Sans", cursive';
            ctx.fillStyle = '#3D2C2C';
            ctx.fillText(baseName, cx + cardW / 2, cardY + 78);

            // Difficulty
            ctx.font = '11px serif';
            ctx.fillText('⭐'.repeat(recipe.difficulty) + '☆'.repeat(3 - recipe.difficulty), cx + cardW / 2, cardY + 95);

            // Description
            ctx.font = '10px "Outfit", sans-serif';
            ctx.fillStyle = '#7A6363';
            ctx.fillText(recipe.description, cx + cardW / 2, cardY + 112);

            // Time
            ctx.font = '10px "Outfit", sans-serif';
            ctx.fillStyle = '#4D96FF';
            ctx.fillText(`⏱️ ${recipe.timeLimit}s`, cx + cardW / 2, cardY + 128);

            // High score
            if (progressionManager) {
                const hs = progressionManager.getHighScore(recipe.name);
                if (hs) {
                    ctx.font = '9px "Outfit", sans-serif';
                    ctx.fillStyle = '#6BCB77';
                    ctx.fillText(`🏆 Best: ${hs.score}pts ${'⭐'.repeat(hs.stars)}`, cx + cardW / 2, cardY + 142);
                }
            }

            // Cook button
            drawRoundRect(ctx, cx + 25, cardY + 155, cardW - 50, 26, 8);
            ctx.fillStyle = '#FF6B6B';
            ctx.fill();
            ctx.font = 'bold 12px "Bubblegum Sans", cursive';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Cook!', cx + cardW / 2, cardY + 172);

            recipe._cardRect = { x: cx, y: cardY, w: cardW, h: cardH };
        });

        // Page navigation arrows
        if (totalPages > 1) {
            ctx.font = 'bold 28px serif';
            ctx.textAlign = 'center';

            // Left arrow
            if (this.menuPage > 0) {
                ctx.fillStyle = '#FF6B6B';
                ctx.fillText('◀', 30, cardY + cardH / 2);
                this._menuLeftArrow = { x: 10, y: cardY + cardH / 2 - 20, w: 40, h: 40 };
            } else {
                this._menuLeftArrow = null;
            }

            // Right arrow
            if (this.menuPage < totalPages - 1) {
                ctx.fillStyle = '#FF6B6B';
                ctx.fillText('▶', canvasW - 30, cardY + cardH / 2);
                this._menuRightArrow = { x: canvasW - 50, y: cardY + cardH / 2 - 20, w: 40, h: 40 };
            } else {
                this._menuRightArrow = null;
            }

            // Page dots
            ctx.font = '14px serif';
            for (let p = 0; p < totalPages; p++) {
                ctx.fillStyle = p === this.menuPage ? '#FF6B6B' : '#DDD';
                ctx.fillText('●', canvasW / 2 - (totalPages * 12) / 2 + p * 12, cardY + cardH + 20);
            }
        }

        // Sound toggle
        ctx.font = '13px "Outfit", sans-serif';
        ctx.fillStyle = '#B8895A';
        ctx.textAlign = 'left';
        this._soundToggleRect = { x: 12, y: canvasH - 35, w: 90, h: 24 };
        drawRoundRect(ctx, 12, canvasH - 35, 90, 24, 8);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
        ctx.fillStyle = '#7A6363';
        ctx.textAlign = 'center';
        ctx.fillText('🔊 Sound', 57, canvasH - 19);

        // Debug toggle
        this._debugToggleRect = { x: 110, y: canvasH - 35, w: 90, h: 24 };
        drawRoundRect(ctx, 110, canvasH - 35, 90, 24, 8);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
        ctx.fillStyle = '#7A6363';
        ctx.fillText('🔧 Debug', 155, canvasH - 19);

        // Tutorial button
        this._tutorialBtnRect = { x: canvasW - 130, y: canvasH - 35, w: 110, h: 24 };
        drawRoundRect(ctx, canvasW - 130, canvasH - 35, 110, 24, 8);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
        ctx.fillStyle = '#7A6363';
        ctx.fillText('❓ How to Play', canvasW - 75, canvasH - 19);

        // Footer
        ctx.font = '12px "Outfit", sans-serif';
        ctx.fillStyle = '#B8895A';
        ctx.textAlign = 'center';
        ctx.fillText('🧑‍🍳 Your AI Chef learns and adapts as you cook!', canvasW / 2, canvasH - 50);

        // Achievements bar
        if (progressionManager) {
            const achs = progressionManager.getAchievements();
            if (achs.length > 0) {
                ctx.font = '12px serif';
                ctx.textAlign = 'center';
                const achText = achs.map(a => a.emoji).join(' ');
                ctx.fillText(achText, canvasW / 2, canvasH - 65);
            }
        }
    }

    // =================================
    // Result screen — enhanced
    // =================================
    renderResult(ctx, recipeTracker, score, canvasW, canvasH, progressionManager) {
        ctx.fillStyle = 'rgba(255, 248, 240, 0.97)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        const success = recipeTracker.completed;

        ctx.font = 'bold 38px "Bubblegum Sans", cursive';
        ctx.fillStyle = success ? '#6BCB77' : '#FF6B6B';
        ctx.textAlign = 'center';
        ctx.fillText(success ? '🎉 Delicious!' : '😅 Time\'s Up!', canvasW / 2, 70);

        // Score
        ctx.font = '22px "Bubblegum Sans", cursive';
        ctx.fillStyle = '#FFD93D';
        ctx.fillText(`Score: ${score}`, canvasW / 2, 110);

        // Stars
        const stars = recipeTracker.getStarRating();
        ctx.font = '32px serif';
        for (let i = 0; i < 5; i++) {
            const bounce = i < stars ? Math.sin(this.starAnim * 3 + i) * 3 : 0;
            ctx.fillText(i < stars ? '⭐' : '☆', canvasW / 2 - 80 + i * 38, 155 + bounce);
        }

        // Stats grid
        ctx.font = '14px "Outfit", sans-serif';
        ctx.fillStyle = '#5A4040';
        const elapsed = recipeTracker.getElapsed().toFixed(1);
        ctx.fillText(`⏱️ Time: ${elapsed}s`, canvasW / 2 - 130, 200);
        ctx.fillText(`🎯 Steps: ${recipeTracker.currentStep}/${recipeTracker.recipe.steps.length}`, canvasW / 2, 200);
        ctx.fillText(`❌ Mistakes: ${recipeTracker.mistakes}`, canvasW / 2 + 130, 200);
        ctx.fillText(`🔥 Best Streak: ${recipeTracker.bestStreak}`, canvasW / 2 - 80, 225);
        ctx.fillText(`⭐ Perfect Steps: ${recipeTracker.perfectSteps}`, canvasW / 2 + 80, 225);

        // Variation bonus
        if (recipeTracker.variationUsed) {
            ctx.font = '13px "Bubblegum Sans", cursive';
            ctx.fillStyle = '#B088F9';
            ctx.fillText(`🎨 Creative Bonus: ${recipeTracker.variationUsed.message} (+${recipeTracker.variationBonus})`, canvasW / 2, 250);
        }

        // High score
        if (progressionManager) {
            const hs = progressionManager.getHighScore(recipeTracker.recipe.name);
            if (hs && score >= hs.score) {
                ctx.font = 'bold 16px "Bubblegum Sans", cursive';
                ctx.fillStyle = '#FFD93D';
                ctx.fillText('🏆 NEW HIGH SCORE! 🏆', canvasW / 2, 275);
            }
        }

        // Recipe log
        ctx.font = '12px "Outfit", sans-serif';
        ctx.fillStyle = '#7A6363';
        const log = recipeTracker.log.slice(-6);
        log.forEach((entry, i) => {
            ctx.fillText(entry, canvasW / 2, 300 + i * 20);
        });

        // Buttons
        drawRoundRect(ctx, canvasW / 2 - 80, 440, 160, 42, 16);
        ctx.fillStyle = '#FF6B6B';
        ctx.fill();
        ctx.font = 'bold 16px "Bubblegum Sans", cursive';
        ctx.fillStyle = 'white';
        ctx.fillText('Cook Again! 🍳', canvasW / 2, 465);

        drawRoundRect(ctx, canvasW / 2 - 80, 495, 160, 34, 12);
        ctx.fillStyle = '#FFD93D';
        ctx.fill();
        ctx.font = 'bold 13px "Bubblegum Sans", cursive';
        ctx.fillStyle = '#3D2C2C';
        ctx.fillText('🏠 Menu', canvasW / 2, 516);

        this._playAgainRect = { x: canvasW / 2 - 80, y: 440, w: 160, h: 42 };
        this._menuRect = { x: canvasW / 2 - 80, y: 495, w: 160, h: 34 };
    }
}

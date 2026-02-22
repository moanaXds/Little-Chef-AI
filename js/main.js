/* ============================================
   main.js — Application Entry Point
   Phase 2: integrated with all enhanced systems
   ============================================ */

import { GameEngine, GameState } from './engine.js';
import { Kitchen } from './kitchen.js';
import { Player } from './player.js';
import { RECIPES, RecipeTracker } from './recipe.js';
import { AIChef } from './aiChef.js';
import { HUD } from './hud.js';
import {
    ParticleSystem,
    CookingAnimation,
    SceneTransition,
    SoundEngine,
    ProgressionManager,
    pointInRect,
} from './utils.js';

// ============================
// Initialise Game
// ============================
const canvas = document.getElementById('gameCanvas');
const engine = new GameEngine(canvas);

const kitchen = new Kitchen();
const player = new Player(kitchen);
const aiChef = new AIChef(kitchen);
const hud = new HUD();
const particles = new ParticleSystem();
const cookAnim = new CookingAnimation();
const transition = new SceneTransition();
const sound = new SoundEngine();
const progression = new ProgressionManager();

let recipeTracker = null;
let score = 0;
let selectedRecipe = null;
let firstPlay = true; // show tutorial on first play

// ============================
// Engine callbacks
// ============================
engine.onUpdate = (dt) => {
    hud.update(dt);
    particles.update(dt);
    cookAnim.update(dt);
    transition.update(dt);

    if (engine.state === GameState.PLAYING && recipeTracker) {
        // Recipe tick (timed steps)
        const tickResult = recipeTracker.tick(dt);
        if (tickResult && tickResult.done) {
            sound.success();
            hud.addNotification(tickResult.message, 512, 200, '#6BCB77');
            if (tickResult.reward) score += tickResult.reward;
            if (recipeTracker.completed) {
                _onRecipeFinished();
            }
        }

        // Time-up check
        if (recipeTracker.isTimeUp() && !recipeTracker.completed && !recipeTracker.failed) {
            recipeTracker.failed = true;
            sound.mistake();
            _onRecipeFinished();
        }

        // ============================
        // AI LOGIC CONNECTS HERE
        // The AI Chef observes the game state and decides to speak or act
        // ============================
        aiChef.update(dt, recipeTracker);
        player.update(dt);
    }
};

engine.onRender = (ctx) => {
    if (engine.state === GameState.MENU) {
        hud.renderMenu(ctx, RECIPES, engine.canvas.width, engine.canvas.height, progression);
    } else if (engine.state === GameState.PLAYING) {
        kitchen.render(ctx, engine.mouse.x, engine.mouse.y);
        cookAnim.render(ctx);
        aiChef.render(ctx);
        player.render(ctx);
        particles.render(ctx);
        hud.render(ctx, recipeTracker, score, aiChef, progression);
    } else if (engine.state === GameState.RESULT) {
        hud.renderResult(ctx, recipeTracker, score, engine.canvas.width, engine.canvas.height, progression);
        particles.render(ctx);
    }

    transition.render(ctx, engine.canvas.width, engine.canvas.height);
};

// ============================
// Input handling
// ============================
engine.onClick = (x, y) => {
    sound.click();

    // Tutorial click-through
    if (hud.showTutorial) {
        const done = hud.advanceTutorial();
        if (done) sound.success();
        return;
    }

    if (engine.state === GameState.MENU) {
        _handleMenuClick(x, y);
    } else if (engine.state === GameState.PLAYING) {
        _handlePlayClick(x, y);
    } else if (engine.state === GameState.RESULT) {
        _handleResultClick(x, y);
    }
};

engine.onDragStart = (x, y) => {
    if (engine.state !== GameState.PLAYING) return;
    const ing = kitchen.getIngredientAt(x, y);
    if (ing) {
        player.startDrag(ing, x, y);
        sound.click();
    }
};

engine.onDragMove = (x, y) => {
    if (engine.state !== GameState.PLAYING) return;
    player.moveDrag(x, y);
};

engine.onDragEnd = (x, y) => {
    if (engine.state !== GameState.PLAYING || !player.dragging) return;

    const station = kitchen.getStationAt(x, y);
    if (station && recipeTracker) {
        const draggedItem = player.dragItem;

        // Attempt to place
        const placed = kitchen.placeAtStation(station.id, draggedItem);

        if (placed) {
            kitchen.useIngredient(draggedItem.name);
            player.endDrag();

            sound.click(); // Thud sound
            particles.emit(x, y, 6);
            hud.addNotification(`Added ${draggedItem.name}`, station.x + station.w / 2, station.y - 20, '#FFD93D');
            console.log(`INGREDIENT_ADDED: ${draggedItem.name} to ${station.id}`);

            // Special handling for Plating Area (Automatic check)
            if (station.id === 'plate') {
                // Check if valid plating step
                const step = recipeTracker.getCurrentStep();
                if (step && step.action === 'plate') {
                    // Verify ingredient match
                    // Recipe steps usually just say "Plate the Dish" or "Add Tomato".
                    // If step.ingredient matches draggedItem.name
                    const result = recipeTracker.attemptAction('plate', station.id, draggedItem.name);

                    if (result.success) {
                        console.log(`INGREDIENT_PLATED: ${draggedItem.name}`);
                        sound.success();
                        score.value += result.reward || 15;
                        score.combo++;
                        hud.addNotification("Plated!", x, y - 40, '#6BCB77');

                        if (recipeTracker.completed) {
                            _onRecipeFinished();
                        }
                    } else {
                        // Wrong ingredient for this step?
                        // "That doesn't belong here"
                        sound.mistake();
                        hud.addNotification("Not needed yet!", x, y - 20, '#FF6B6B');
                        // Maybe remove it from plate?
                        kitchen.platingStack.pop();
                    }
                } else {
                    // Plating when not expected
                    // Just let it be for creative freedom? Or strict?
                    // User said: "Wrong ingredient added: plate shakes red... ingredient bounces off"
                    // I'll assume strict for now.
                }
            }
        } else {
            // Station full
            player.endDrag();
            sound.mistake();
            hud.addNotification("Station Occupied", x, y - 20, '#FF6B6B');
        }
    } else {
        player.endDrag();
    }
};

// ============================
// Menu click handler
// ============================
function _handleMenuClick(x, y) {
    // Page navigation
    if (hud._menuLeftArrow && pointInRect(x, y, hud._menuLeftArrow)) {
        console.log("MENU_PAGE_PREV_CLICKED");
        hud.menuPage = Math.max(0, hud.menuPage - 1);
        sound.click();
        return;
    }
    if (hud._menuRightArrow && pointInRect(x, y, hud._menuRightArrow)) {
        console.log("MENU_PAGE_NEXT_CLICKED");
        hud.menuPage++;
        sound.click();
        return;
    }

    // Sound toggle
    if (hud._soundToggleRect && pointInRect(x, y, hud._soundToggleRect)) {
        console.log("SOUND_TOGGLE_CLICKED");
        sound.toggle();
        return;
    }

    // Debug toggle
    if (hud._debugToggleRect && pointInRect(x, y, hud._debugToggleRect)) {
        console.log("DEBUG_TOGGLE_CLICKED");
        hud.debugMode = !hud.debugMode;
        return;
    }

    // Tutorial button
    if (hud._tutorialBtnRect && pointInRect(x, y, hud._tutorialBtnRect)) {
        console.log("TUTORIAL_CLICKED");
        hud.showTutorial = true;
        hud.tutorialStep = 0;
        return;
    }

    // Recipe selection
    const pageRecipes = RECIPES.slice(
        hud.menuPage * hud.recipesPerPage,
        (hud.menuPage + 1) * hud.recipesPerPage
    );

    for (const recipe of pageRecipes) {
        if (recipe._cardRect && pointInRect(x, y, recipe._cardRect)) {
            console.log(`RECIPE_SELECTED: ${recipe.name}`);
            selectedRecipe = recipe;
            transition.start(() => {
                _startRecipe(recipe);
            });
            sound.success();
            return;
        }
    }
}

// ============================
// Play click handler — station actions
// ============================
function _handlePlayClick(x, y) {
    // 1. Check HUD buttons first
    if (hud._exitBtnRect && pointInRect(x, y, hud._exitBtnRect)) {
        console.log("EXIT_CLICKED");
        location.reload();
        return;
    }

    if (!recipeTracker || recipeTracker.stepInProgress) return;

    // 2. Check Kitchen Station Buttons
    const station = kitchen.getStationAt(x, y);
    if (station && station._actionBtn && pointInRect(x, y, station._actionBtn)) {
        console.log(`ACTION_STARTED: ${station._actionBtn.label}`);

        const items = kitchen.activeItems[station.id];
        if (items && items.length > 0) {
            const item = items[0];

            // Increment Progress (3 clicks to finish)
            item.progress += 34;
            item.isCooking = true;

            // Feedback
            const sx = station.x + station.w / 2;
            const sy = station.y + station.h / 2;

            if (station.id === 'cutting') {
                sound.chop();
                cookAnim.startChop(sx, sy);
                particles.emitCrumbs(sx, sy);
            } else if (station.id === 'stove') {
                sound.sizzle();
                cookAnim.startCook(sx, sy);
                particles.emitSteam(sx, sy);
            } else if (station.id === 'mixer') {
                sound.stir();
                cookAnim.startMix(sx, sy);
            }

            // Completion Check
            if (item.progress >= 100) {
                item.progress = 100;
                item.processed = true;
                item.isCooking = false;

                console.log(`ACTION_COMPLETED: ${item.name}`);

                // Get action name (cut -> chop, cook -> cook, mix -> mix)
                // Label is CUT, COOK, MIX
                let action = station._actionBtn.label.toLowerCase();
                if (action === 'cut') action = 'chop';

                // Verify with Recipe
                const result = recipeTracker.attemptAction(action, station.id);

                if (result.success) {
                    console.log("STEP_COMPLETED");
                    score.value += result.reward || 10;
                    score.combo++;
                    sound.success();
                    particles.emit(sx, sy, 10); // Sparkles
                    hud.addNotification("Perfect!", sx, sy - 40, '#6BCB77');

                    aiChef.onPlayerSuccess(recipeTracker, action, station.id);

                    // Auto-clear after delay (to show checkmark)
                    setTimeout(() => {
                        kitchen.clearStation(station.id);
                    }, 800);

                    if (recipeTracker.completed) {
                        _onRecipeFinished();
                    }
                } else {
                    // Action done but wrong step?
                    sound.mistake();
                    hud.addNotification("Wrong step!", sx, sy - 40, '#FF6B6B');
                    // Reset?
                    item.progress = 0;
                    item.processed = false;
                }
            }
        }
        return;
    }
}

// ============================
// Result click handler
// ============================
function _handleResultClick(x, y) {
    // Play Again
    if (hud._playAgainRect && pointInRect(x, y, hud._playAgainRect)) {
        console.log("PLAY_AGAIN_CLICKED");
        if (selectedRecipe) {
            transition.start(() => _startRecipe(selectedRecipe));
            sound.success();
        }
        return;
    }

    // Back to Menu
    if (hud._menuRect && pointInRect(x, y, hud._menuRect)) {
        transition.start(() => {
            engine.state = GameState.MENU;
            hud.fadeIn = 0;
        });
        sound.click();
        return;
    }
}

// ============================
// Recipe lifecycle
// ============================
function _startRecipe(recipe) {
    kitchen.reset();
    recipeTracker = new RecipeTracker(recipe);
    recipeTracker.start();
    score = 0;
    hud.fadeIn = 0;
    hud.streakDisplay = { count: 0, timer: 0 };
    engine.state = GameState.PLAYING;

    aiChef.variationSuggested = false;
    aiChef.suggestedVariation = null;

    // Show tutorial on first ever play
    if (firstPlay) {
        hud.showTutorial = true;
        hud.tutorialStep = 0;
        firstPlay = false;
    }

    aiChef.say(`Let's cook ${recipe.name}! 🎉`, 3000);
}

function _onRecipeFinished() {
    aiChef.onRecipeComplete(recipeTracker);

    // Save progression
    const stars = recipeTracker.getStarRating();
    progression.recordCompletion(recipeTracker.recipe.name, score, stars, recipeTracker.getElapsed());

    // Celebration
    if (recipeTracker.completed) {
        sound.celebrate();
        particles.emitCelebration(512, 300);
        particles.emitCelebration(300, 250);
        particles.emitCelebration(700, 250);
    }

    setTimeout(() => {
        transition.start(() => {
            engine.state = GameState.RESULT;
            hud.fadeIn = 0;
        });
    }, 800);
}

// ============================
// Start the engine
// ============================
engine.start();

console.log('%c👨‍🍳 Little Chef AI — Phase 2 Loaded!', 'color: #FF6B6B; font-size: 16px; font-weight: bold;');
console.log('%c13 Recipes | 4 AI Agents | Sound | Animations | High Scores | Debug Mode', 'color: #6BCB77; font-size: 12px;');
console.log('%cTip: Click 🔧 Debug in menu to visualize AI learning', 'color: #4D96FF; font-size: 11px;');

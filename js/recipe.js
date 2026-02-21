/* ============================================
   recipe.js — Recipe Definitions & Tracker
   Phase 2: 13 recipes, creative variations, enhanced scoring
   ============================================ */

/**
 * Recipe step actions
 */
export const Actions = {
    PICK: 'pick',
    CHOP: 'chop',
    MIX: 'mix',
    COOK: 'cook',
    PLATE: 'plate',
};

/**
 * Creative variations per recipe (used by CreativityAgent)
 */
export const RECIPE_VARIATIONS = {
    'Pancakes 🥞': [
        { id: 'choco_drizzle', emoji: '🍫', message: "Chocolate drizzle! 🍫✨", bonusPoints: 3 },
        { id: 'fruit_topping', emoji: '🍓', message: "Strawberries on top! 🍓🎨", bonusPoints: 3 },
        { id: 'whipped_cream', emoji: '🍦', message: "Whipped cream? 🍦😋", bonusPoints: 2 },
        { id: 'funny_face', emoji: '😄', message: "Make a funny face! 😄🎭", bonusPoints: 4 },
    ],
    'Fruit Salad 🥗': [
        { id: 'honey_drizzle', emoji: '🍯', message: "Honey drizzle! 🍯💛", bonusPoints: 3 },
        { id: 'yogurt_dip', emoji: '🥛', message: "Yogurt dip! 🥛✨", bonusPoints: 2 },
        { id: 'star_shapes', emoji: '⭐', message: "Star-shaped cuts! ⭐🔪", bonusPoints: 4 },
        { id: 'rainbow_arrange', emoji: '🌈', message: "Rainbow arrangement! 🌈🎨", bonusPoints: 3 },
    ],
    'Chocolate Cookie 🍪': [
        { id: 'sprinkles', emoji: '🎉', message: "Colorful sprinkles! 🎉🌈", bonusPoints: 2 },
        { id: 'double_choco', emoji: '🍫', message: "Double chocolate! 🍫🍫", bonusPoints: 3 },
        { id: 'cookie_sandwich', emoji: '🍦', message: "Ice cream sandwich! 🍦🍪", bonusPoints: 5 },
        { id: 'heart_shape', emoji: '❤️', message: "Heart-shaped! ❤️", bonusPoints: 3 },
    ],
    'Pasta Marinara 🍝': [
        { id: 'extra_cheese', emoji: '🧀', message: "Extra cheese! 🧀✨", bonusPoints: 2 },
        { id: 'herb_garnish', emoji: '🌿', message: "Herb garnish! 🌿🍝", bonusPoints: 3 },
        { id: 'garlic_bread', emoji: '🍞', message: "Garlic bread! 🍞❤️", bonusPoints: 4 },
    ],
    'Smoothie 🥤': [
        { id: 'whipped_top', emoji: '☁️', message: "Whipped cream top! ☁️😋", bonusPoints: 2 },
        { id: 'layer_colors', emoji: '🌈', message: "Layered colors! 🌈", bonusPoints: 3 },
        { id: 'frozen_style', emoji: '🧊', message: "Frozen style! 🧊❄️", bonusPoints: 3 },
    ],
    'Omelette 🍳': [
        { id: 'herbs_top', emoji: '🌿', message: "Fresh herbs! 🌿", bonusPoints: 2 },
        { id: 'pepper_kick', emoji: '🌶️', message: "Spicy kick! 🌶️🔥", bonusPoints: 3 },
        { id: 'folded_art', emoji: '🎨', message: "Artistic fold! 🎨", bonusPoints: 4 },
    ],
    'Grilled Cheese 🧀': [
        { id: 'tomato_soup', emoji: '🍅', message: "With tomato soup! 🍅", bonusPoints: 4 },
        { id: 'double_cheese', emoji: '🧀', message: "Double cheese! 🧀🧀", bonusPoints: 3 },
        { id: 'crispy_edges', emoji: '✨', message: "Extra crispy! ✨", bonusPoints: 2 },
    ],
    'Fried Rice 🍚': [
        { id: 'soy_drizzle', emoji: '🥢', message: "Soy drizzle! 🥢", bonusPoints: 2 },
        { id: 'egg_flower', emoji: '🌸', message: "Egg flower on top! 🌸", bonusPoints: 3 },
        { id: 'veggie_art', emoji: '🎨', message: "Veggie art plating! 🎨", bonusPoints: 4 },
    ],
    'Lemonade 🍋': [
        { id: 'mint_leaf', emoji: '🌿', message: "Fresh mint! 🌿", bonusPoints: 2 },
        { id: 'berry_twist', emoji: '🫐', message: "Berry twist! 🫐", bonusPoints: 3 },
        { id: 'ice_sparkle', emoji: '✨', message: "Sparkling ice! ✨🧊", bonusPoints: 2 },
    ],
    'PB&J Sandwich 🥪': [
        { id: 'banana_slices', emoji: '🍌', message: "Banana slices! 🍌", bonusPoints: 3 },
        { id: 'honey_drizzle', emoji: '🍯', message: "Honey drizzle! 🍯", bonusPoints: 2 },
        { id: 'funny_cut', emoji: '⭐', message: "Fun shape cut! ⭐", bonusPoints: 3 },
    ],
    'Bruschetta 🍅': [
        { id: 'balsamic', emoji: '🫒', message: "Balsamic glaze! 🫒", bonusPoints: 3 },
        { id: 'cheese_top', emoji: '🧀', message: "Cheese topping! 🧀", bonusPoints: 2 },
        { id: 'garlic_rub', emoji: '🧄', message: "Extra garlic! 🧄", bonusPoints: 2 },
    ],
    'Berry Parfait 🫐': [
        { id: 'granola_layer', emoji: '🥣', message: "Crunchy granola! 🥣", bonusPoints: 3 },
        { id: 'choco_shavings', emoji: '🍫', message: "Chocolate shavings! 🍫", bonusPoints: 3 },
        { id: 'mint_sprig', emoji: '🌿', message: "Mint sprig! 🌿", bonusPoints: 2 },
    ],
    'Banana Split 🍌': [
        { id: 'cherry_top', emoji: '🍒', message: "Cherry on top! 🍒", bonusPoints: 2 },
        { id: 'nuts_sprinkle', emoji: '🥜', message: "Nuts sprinkle! 🥜", bonusPoints: 3 },
        { id: 'triple_scoop', emoji: '🍨', message: "Triple scoop! 🍨", bonusPoints: 4 },
    ],
};

/**
 * Built-in recipes — 13 total, difficulty 1–3
 */
export const RECIPES = [
    // ──── Difficulty 1 (Easy) ────
    {
        name: 'Pancakes 🥞',
        difficulty: 1,
        description: 'Fluffy golden pancakes!',
        timeLimit: 120,
        steps: [
            { action: Actions.PICK, ingredient: 'Flour', station: 'mixer', description: 'Add flour to the mixer' },
            { action: Actions.PICK, ingredient: 'Egg', station: 'mixer', description: 'Crack an egg into the mixer' },
            { action: Actions.PICK, ingredient: 'Milk', station: 'mixer', description: 'Pour in some milk' },
            { action: Actions.PICK, ingredient: 'Sugar', station: 'mixer', description: 'Add a pinch of sugar' },
            { action: Actions.MIX, station: 'mixer', description: 'Mix the batter well! 🥣', duration: 3 },
            { action: Actions.COOK, station: 'stove', description: 'Cook the pancakes on the stove 🔥', duration: 5 },
            { action: Actions.PLATE, station: 'plate', description: 'Plate up the pancakes! 🍽️' },
        ],
    },
    {
        name: 'Fruit Salad 🥗',
        difficulty: 1,
        description: 'A refreshing fruit salad!',
        timeLimit: 90,
        steps: [
            { action: Actions.PICK, ingredient: 'Apple', station: 'cutting', description: 'Grab an apple' },
            { action: Actions.PICK, ingredient: 'Banana', station: 'cutting', description: 'Grab a banana' },
            { action: Actions.PICK, ingredient: 'Strawberry', station: 'cutting', description: 'Grab some strawberries' },
            { action: Actions.CHOP, station: 'cutting', description: 'Chop all the fruits! 🔪', duration: 4 },
            { action: Actions.MIX, station: 'mixer', description: 'Toss them together 🥣', duration: 2 },
            { action: Actions.PLATE, station: 'plate', description: 'Serve the salad! 🍽️' },
        ],
    },
    {
        name: 'Smoothie 🥤',
        difficulty: 1,
        description: 'A yummy blended smoothie!',
        timeLimit: 60,
        steps: [
            { action: Actions.PICK, ingredient: 'Banana', station: 'mixer', description: 'Add a banana' },
            { action: Actions.PICK, ingredient: 'Strawberry', station: 'mixer', description: 'Add strawberries' },
            { action: Actions.PICK, ingredient: 'Milk', station: 'mixer', description: 'Pour in milk' },
            { action: Actions.MIX, station: 'mixer', description: 'Blend it all! 🥣', duration: 3 },
            { action: Actions.PLATE, station: 'plate', description: 'Pour into a glass! 🥤' },
        ],
    },
    {
        name: 'Lemonade 🍋',
        difficulty: 1,
        description: 'Fresh squeezed lemonade!',
        timeLimit: 75,
        steps: [
            { action: Actions.PICK, ingredient: 'Lemon', station: 'cutting', description: 'Grab some lemons 🍋' },
            { action: Actions.CHOP, station: 'cutting', description: 'Squeeze the lemons! 🔪', duration: 3 },
            { action: Actions.PICK, ingredient: 'Sugar', station: 'mixer', description: 'Add sugar' },
            { action: Actions.MIX, station: 'mixer', description: 'Mix with water! 🥣', duration: 2 },
            { action: Actions.PLATE, station: 'plate', description: 'Pour into a glass! 🍹' },
        ],
    },

    // ──── Difficulty 2 (Medium) ────
    {
        name: 'Chocolate Cookie 🍪',
        difficulty: 2,
        description: 'Warm gooey chocolate cookies!',
        timeLimit: 150,
        steps: [
            { action: Actions.PICK, ingredient: 'Flour', station: 'mixer', description: 'Add flour' },
            { action: Actions.PICK, ingredient: 'Butter', station: 'mixer', description: 'Add butter' },
            { action: Actions.PICK, ingredient: 'Sugar', station: 'mixer', description: 'Add sugar' },
            { action: Actions.PICK, ingredient: 'Egg', station: 'mixer', description: 'Crack an egg' },
            { action: Actions.PICK, ingredient: 'Chocolate', station: 'mixer', description: 'Add chocolate chips 🍫' },
            { action: Actions.MIX, station: 'mixer', description: 'Mix the cookie dough 🥣', duration: 4 },
            { action: Actions.COOK, station: 'stove', description: 'Bake the cookies 🔥', duration: 8 },
            { action: Actions.PLATE, station: 'plate', description: 'Plate the fresh cookies! 🍪' },
        ],
    },
    {
        name: 'Pasta Marinara 🍝',
        difficulty: 2,
        description: 'Classic pasta with tomato sauce!',
        timeLimit: 180,
        steps: [
            { action: Actions.PICK, ingredient: 'Tomato', station: 'cutting', description: 'Grab tomatoes' },
            { action: Actions.PICK, ingredient: 'Onion', station: 'cutting', description: 'Grab an onion' },
            { action: Actions.CHOP, station: 'cutting', description: 'Chop the veggies 🔪', duration: 4 },
            { action: Actions.PICK, ingredient: 'Pasta', station: 'stove', description: 'Add pasta to the pot' },
            { action: Actions.COOK, station: 'stove', description: 'Cook pasta and sauce 🔥', duration: 8 },
            { action: Actions.PICK, ingredient: 'Cheese', station: 'plate', description: 'Add cheese on top 🧀' },
            { action: Actions.PLATE, station: 'plate', description: 'Plate the pasta! 🍝' },
        ],
    },
    {
        name: 'Omelette 🍳',
        difficulty: 2,
        description: 'A fluffy veggie omelette!',
        timeLimit: 120,
        steps: [
            { action: Actions.PICK, ingredient: 'Egg', station: 'mixer', description: 'Crack some eggs 🥚' },
            { action: Actions.PICK, ingredient: 'Milk', station: 'mixer', description: 'Splash of milk' },
            { action: Actions.MIX, station: 'mixer', description: 'Whisk the eggs! 🥣', duration: 2 },
            { action: Actions.PICK, ingredient: 'Tomato', station: 'cutting', description: 'Grab a tomato' },
            { action: Actions.PICK, ingredient: 'Onion', station: 'cutting', description: 'Grab an onion' },
            { action: Actions.CHOP, station: 'cutting', description: 'Dice the veggies! 🔪', duration: 3 },
            { action: Actions.COOK, station: 'stove', description: 'Cook the omelette! 🔥', duration: 5 },
            { action: Actions.PICK, ingredient: 'Cheese', station: 'plate', description: 'Cheese on top! 🧀' },
            { action: Actions.PLATE, station: 'plate', description: 'Fold & plate! 🍽️' },
        ],
    },
    {
        name: 'Grilled Cheese 🧀',
        difficulty: 2,
        description: 'Crispy, melty grilled cheese!',
        timeLimit: 100,
        steps: [
            { action: Actions.PICK, ingredient: 'Bread', station: 'cutting', description: 'Grab bread slices 🍞' },
            { action: Actions.PICK, ingredient: 'Butter', station: 'cutting', description: 'Spread butter' },
            { action: Actions.PICK, ingredient: 'Cheese', station: 'stove', description: 'Layer the cheese 🧀' },
            { action: Actions.COOK, station: 'stove', description: 'Grill until golden! 🔥', duration: 6 },
            { action: Actions.PLATE, station: 'plate', description: 'Slice & serve! 🍽️' },
        ],
    },
    {
        name: 'PB&J Sandwich 🥪',
        difficulty: 2,
        description: 'The classic PB&J!',
        timeLimit: 80,
        steps: [
            { action: Actions.PICK, ingredient: 'Bread', station: 'cutting', description: 'Grab bread 🍞' },
            { action: Actions.PICK, ingredient: 'PeanutButter', station: 'cutting', description: 'Spread peanut butter 🥜' },
            { action: Actions.PICK, ingredient: 'Strawberry', station: 'cutting', description: 'Add strawberry jam 🍓' },
            { action: Actions.CHOP, station: 'cutting', description: 'Cut in half! 🔪', duration: 2 },
            { action: Actions.PLATE, station: 'plate', description: 'Plate the sandwich! 🍽️' },
        ],
    },

    // ──── Difficulty 3 (Hard) ────
    {
        name: 'Fried Rice 🍚',
        difficulty: 3,
        description: 'Savory veggie fried rice!',
        timeLimit: 200,
        steps: [
            { action: Actions.PICK, ingredient: 'Rice', station: 'stove', description: 'Add rice to the wok 🍚' },
            { action: Actions.COOK, station: 'stove', description: 'Cook the rice! 🔥', duration: 5 },
            { action: Actions.PICK, ingredient: 'Onion', station: 'cutting', description: 'Grab an onion' },
            { action: Actions.PICK, ingredient: 'Garlic', station: 'cutting', description: 'Grab garlic 🧄' },
            { action: Actions.PICK, ingredient: 'Tomato', station: 'cutting', description: 'Grab a tomato' },
            { action: Actions.CHOP, station: 'cutting', description: 'Dice all veggies! 🔪', duration: 5 },
            { action: Actions.PICK, ingredient: 'Egg', station: 'stove', description: 'Crack an egg in' },
            { action: Actions.COOK, station: 'stove', description: 'Stir-fry everything! 🔥', duration: 7 },
            { action: Actions.PICK, ingredient: 'Salt', station: 'plate', description: 'Season with salt 🧂' },
            { action: Actions.PLATE, station: 'plate', description: 'Plate the fried rice! 🍚' },
        ],
    },
    {
        name: 'Bruschetta 🍅',
        difficulty: 3,
        description: 'Italian bruschetta appetizer!',
        timeLimit: 160,
        steps: [
            { action: Actions.PICK, ingredient: 'Bread', station: 'stove', description: 'Toast the bread 🍞' },
            { action: Actions.COOK, station: 'stove', description: 'Toast until crispy! 🔥', duration: 4 },
            { action: Actions.PICK, ingredient: 'Tomato', station: 'cutting', description: 'Grab tomatoes' },
            { action: Actions.PICK, ingredient: 'Onion', station: 'cutting', description: 'Grab an onion' },
            { action: Actions.PICK, ingredient: 'Garlic', station: 'cutting', description: 'Grab garlic 🧄' },
            { action: Actions.CHOP, station: 'cutting', description: 'Finely dice everything! 🔪', duration: 5 },
            { action: Actions.MIX, station: 'mixer', description: 'Mix the topping! 🥣', duration: 2 },
            { action: Actions.PICK, ingredient: 'Salt', station: 'plate', description: 'Add salt 🧂' },
            { action: Actions.PLATE, station: 'plate', description: 'Assemble & serve! 🍽️' },
        ],
    },
    {
        name: 'Berry Parfait 🫐',
        difficulty: 3,
        description: 'Layered berry parfait!',
        timeLimit: 150,
        steps: [
            { action: Actions.PICK, ingredient: 'Strawberry', station: 'cutting', description: 'Grab strawberries 🍓' },
            { action: Actions.PICK, ingredient: 'Blueberry', station: 'cutting', description: 'Grab blueberries 🫐' },
            { action: Actions.CHOP, station: 'cutting', description: 'Slice the berries! 🔪', duration: 3 },
            { action: Actions.PICK, ingredient: 'Cream', station: 'mixer', description: 'Add cream 🍦' },
            { action: Actions.PICK, ingredient: 'Vanilla', station: 'mixer', description: 'Add vanilla 🧁' },
            { action: Actions.PICK, ingredient: 'Sugar', station: 'mixer', description: 'Add sugar' },
            { action: Actions.MIX, station: 'mixer', description: 'Whip the cream! 🥣', duration: 4 },
            { action: Actions.PICK, ingredient: 'Honey', station: 'plate', description: 'Drizzle honey 🍯' },
            { action: Actions.PLATE, station: 'plate', description: 'Layer the parfait! 🫐' },
        ],
    },
    {
        name: 'Banana Split 🍌',
        difficulty: 3,
        description: 'The ultimate banana split!',
        timeLimit: 180,
        steps: [
            { action: Actions.PICK, ingredient: 'Banana', station: 'cutting', description: 'Grab a banana 🍌' },
            { action: Actions.CHOP, station: 'cutting', description: 'Split the banana! 🔪', duration: 2 },
            { action: Actions.PICK, ingredient: 'Cream', station: 'mixer', description: 'Add cream 🍦' },
            { action: Actions.PICK, ingredient: 'Vanilla', station: 'mixer', description: 'Add vanilla 🧁' },
            { action: Actions.MIX, station: 'mixer', description: 'Whip the cream! 🥣', duration: 3 },
            { action: Actions.PICK, ingredient: 'Chocolate', station: 'stove', description: 'Melt chocolate 🍫' },
            { action: Actions.COOK, station: 'stove', description: 'Melt until smooth! 🔥', duration: 4 },
            { action: Actions.PICK, ingredient: 'Strawberry', station: 'plate', description: 'Add strawberries 🍓' },
            { action: Actions.PICK, ingredient: 'Honey', station: 'plate', description: 'Drizzle honey 🍯' },
            { action: Actions.PLATE, station: 'plate', description: 'Assemble the split! 🍌' },
        ],
    },
];

/**
 * RecipeTracker — validates actions, computes score, tracks streaks
 * Phase 2: enhanced with combos, streak tracking, variation bonuses
 */
export class RecipeTracker {
    constructor(recipe) {
        this.recipe = recipe;
        this.currentStep = 0;
        this.completed = false;
        this.failed = false;
        this.score = 0;
        this.mistakes = 0;
        this.startTime = null;
        this.endTime = null;
        this.stepTimer = 0;
        this.stepInProgress = false;
        this.log = [];

        // Phase 2 additions
        this.streak = 0;          // consecutive correct actions
        this.bestStreak = 0;
        this.variationUsed = null; // which creative variation was applied
        this.variationBonus = 0;
        this.perfectSteps = 0;    // steps done quickly & correctly
    }

    start() {
        this.startTime = Date.now();
    }

    getCurrentStep() {
        if (this.currentStep >= this.recipe.steps.length) return null;
        return this.recipe.steps[this.currentStep];
    }

    getProgress() {
        return this.currentStep / this.recipe.steps.length;
    }

    getElapsed() {
        if (!this.startTime) return 0;
        return ((this.endTime || Date.now()) - this.startTime) / 1000;
    }

    getRemaining() {
        return Math.max(0, this.recipe.timeLimit - this.getElapsed());
    }

    isTimeUp() {
        return this.getRemaining() <= 0;
    }

    /** Apply a creative variation bonus */
    applyVariation(variation) {
        this.variationUsed = variation;
        this.variationBonus = variation.bonusPoints || 3;
        this.score += this.variationBonus;
        this.log.push(`🎨 Creative bonus: ${variation.message} (+${this.variationBonus})`);
    }

    /** Calculate star rating (0-5) */
    getStarRating() {
        const baseScore = this.score;
        const timeRatio = this.getRemaining() / this.recipe.timeLimit;
        const mistakeRatio = this.mistakes / Math.max(1, this.recipe.steps.length);
        const streakBonus = this.bestStreak >= 3 ? 0.5 : 0;

        let rating = 2; // base
        if (baseScore > this.recipe.steps.length * 10) rating++;
        if (timeRatio > 0.3) rating++;
        if (mistakeRatio < 0.15) rating++;
        rating += streakBonus;
        if (this.variationUsed) rating += 0.5;

        return Math.min(5, Math.max(0, Math.round(rating)));
    }

    attemptAction(action, stationId, ingredientName = null) {
        if (this.completed || this.failed) {
            return { success: false, message: 'Recipe already finished!', reward: 0 };
        }

        if (this.isTimeUp()) {
            this.failed = true;
            return { success: false, message: '⏰ Time\'s up!', reward: -5 };
        }

        const step = this.getCurrentStep();
        if (!step) {
            return { success: false, message: 'No more steps!', reward: 0 };
        }

        // Validate action
        if (step.action !== action) {
            this.mistakes++;
            this.streak = 0;
            this.log.push(`❌ Wrong action: tried ${action}, need ${step.action}`);
            return { success: false, message: `Hmm, try to ${step.action} instead!`, reward: -2 };
        }

        // Validate station
        if (step.station && step.station !== stationId) {
            this.mistakes++;
            this.streak = 0;
            this.log.push(`❌ Wrong station: tried ${stationId}, need ${step.station}`);
            return { success: false, message: `Use the ${step.station} for this step!`, reward: -1 };
        }

        // Validate ingredient
        if (step.ingredient && ingredientName && step.ingredient !== ingredientName) {
            this.mistakes++;
            this.streak = 0;
            this.log.push(`❌ Wrong ingredient: tried ${ingredientName}, need ${step.ingredient}`);
            return { success: false, message: `We need ${step.ingredient}, not ${ingredientName}!`, reward: -3 };
        }

        // Correct action!
        this.streak++;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
        this.perfectSteps++;

        // Streak bonus
        let streakBonus = 0;
        let streakMsg = '';
        if (this.streak === 3) { streakBonus = 3; streakMsg = ' 🔥 3x Streak!'; }
        else if (this.streak === 5) { streakBonus = 5; streakMsg = ' 🔥🔥 5x Streak!'; }
        else if (this.streak >= 7) { streakBonus = 8; streakMsg = ' 🔥🔥🔥 AMAZING STREAK!'; }

        this.log.push(`✅ Step ${this.currentStep + 1}: ${step.description}${streakMsg}`);
        this.score += 10 + streakBonus;

        if (step.duration && !this.stepInProgress) {
            this.stepInProgress = true;
            this.stepTimer = step.duration;
            return { success: true, message: `${step.description} (${step.duration}s)${streakMsg}`, reward: 2 + streakBonus, waitForTimer: true, streak: this.streak };
        }

        this.currentStep++;

        if (this.currentStep >= this.recipe.steps.length) {
            this.completed = true;
            this.endTime = Date.now();
            const timeBonus = this.getRemaining() > 0 ? 5 : 0;
            const perfBonus = this.mistakes === 0 ? 15 : 0;
            this.score += 20 + timeBonus + perfBonus;
            const msg = perfBonus > 0 ? '🎉 PERFECT Recipe Complete! 🌟' : '🎉 Recipe Complete!';
            return { success: true, message: msg, reward: 10 + timeBonus + perfBonus, streak: this.streak };
        }

        return { success: true, message: `Great! Next: ${this.getCurrentStep().description}${streakMsg}`, reward: 2 + streakBonus, streak: this.streak };
    }

    tick(dt) {
        if (this.stepInProgress && this.stepTimer > 0) {
            this.stepTimer -= dt;
            if (this.stepTimer <= 0) {
                this.stepInProgress = false;
                this.stepTimer = 0;
                this.currentStep++;

                if (this.currentStep >= this.recipe.steps.length) {
                    this.completed = true;
                    this.endTime = Date.now();
                    const perfBonus = this.mistakes === 0 ? 15 : 0;
                    this.score += 20 + perfBonus;
                    return { done: true, message: '🎉 Recipe Complete!', reward: 10 + perfBonus };
                }

                return { done: true, message: `Done! Next: ${this.getCurrentStep().description}`, reward: 2 };
            }
            return { done: false, remaining: this.stepTimer };
        }
        return null;
    }
}

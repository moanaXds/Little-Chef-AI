/* ============================================
   creativityAgent.js — Fun Variations & Garnishes
   Phase 2: integrated with RECIPE_VARIATIONS, bonus scoring,
   more frequent suggestions, fun facts, mini-games
   ============================================ */

import { QTable, REWARDS } from '../qLearning.js';
import { randomChoice } from '../utils.js';
import { RECIPE_VARIATIONS } from '../recipe.js';

export class CreativityAgent {
    constructor() {
        this.qTable = new QTable({ alpha: 0.1, gamma: 0.8, epsilon: 0.4 });
        this.name = 'CreativityAgent';
        // Track which variations have been suggested
        this.suggestedVariations = {}; // recipeName → Set of variation ids
        this.totalSuggestions = 0;
        this.acceptedSuggestions = 0;
    }

    /**
     * Suggest a creative variation from the recipe's variation list
     * Uses Q-learning to pick the best variation for this recipe
     */
    suggest(recipeName, availableIngredients) {
        const variations = RECIPE_VARIATIONS[recipeName];
        if (!variations || variations.length === 0) return null;

        const state = `creativity_${recipeName}_round${this.totalSuggestions}`;
        const actions = variations.map(v => v.id);
        const chosen = this.qTable.selectAction(state, actions);
        const variation = variations.find(v => v.id === chosen) || variations[0];

        this.totalSuggestions++;

        // Track suggestion
        if (!this.suggestedVariations[recipeName]) {
            this.suggestedVariations[recipeName] = new Set();
        }
        this.suggestedVariations[recipeName].add(chosen);

        return {
            suggestion: variation.id,
            emoji: variation.emoji,
            message: variation.message,
            bonusPoints: variation.bonusPoints || 3,
        };
    }

    /**
     * Suggest a mid-recipe variation (called during gameplay for more frequent suggestions)
     */
    suggestMidRecipe(recipeName, currentStep, totalSteps) {
        // Only suggest at certain progress points
        const progress = currentStep / totalSteps;
        if (progress < 0.3 || progress > 0.9) return null;

        // 30% chance to suggest during gameplay
        if (Math.random() > 0.3) return null;

        return this.suggest(recipeName);
    }

    /**
     * Learn from whether the player liked/used the suggestion
     */
    learn(recipeName, suggestion, wasUsed) {
        const state = `creativity_${recipeName}_round${this.totalSuggestions}`;
        const reward = wasUsed ? REWARDS.CREATIVE_ACTION : -0.5;
        this.qTable.update(state, suggestion, reward, state, [suggestion]);

        if (wasUsed) this.acceptedSuggestions++;
    }

    /**
     * Get a random fun fact about cooking (expanded set)
     */
    getFunFact() {
        const facts = [
            "🧑‍🍳 Did you know? The tallest pancake stack was over 3 feet high!",
            "🍫 Chocolate was once used as money by the Aztecs!",
            "🍓 Strawberries are the only fruit with seeds on the outside!",
            "🍝 Italians eat about 60 pounds of pasta per person each year!",
            "🍌 Bananas are berries, but strawberries aren't! Mind blown! 🤯",
            "🥚 A chef's hat traditionally has 100 folds — one for each way to cook an egg!",
            "🧀 Some cheese is so valuable it's stored in bank vaults!",
            "🍎 Apples float in water because they're 25% air!",
            "🍯 Honey never expires — archaeologists found 3000-year-old honey that was still good!",
            "🧄 Garlic helps keep vampires away... and adds amazing flavor! 🧛",
            "🍋 Lemons contain more sugar than strawberries!",
            "🍞 The oldest bread ever found was 14,400 years old!",
            "🧈 It takes about 21 pounds of milk to make 1 pound of butter!",
            "🥜 Peanuts aren't nuts — they're legumes that grow underground!",
            "🍚 Rice feeds more than half the world's population!",
            "🫐 Blueberries are one of the only natural foods that are truly blue!",
        ];
        return randomChoice(facts);
    }

    /**
     * Get a cooking tip related to the current action
     */
    getCookingTip(action) {
        const tips = {
            chop: [
                "🔪 Tip: Curl your fingers when chopping to keep them safe!",
                "🔪 A sharp knife is actually safer than a dull one!",
                "🔪 Cut veggies the same size for even cooking!",
            ],
            mix: [
                "🥣 Tip: Mix in one direction for a smoother texture!",
                "🥣 Don't overmix — it can make things tough!",
                "🥣 Room temperature ingredients mix better!",
            ],
            cook: [
                "🔥 Tip: Let the pan heat up before adding food!",
                "🔥 Don't stir too often — let things brown!",
                "🔥 Lower heat = more control over cooking!",
            ],
            plate: [
                "🍽️ Tip: We eat with our eyes first — make it pretty!",
                "🍽️ Use the back of a spoon for smooth sauces!",
                "🍽️ Odd numbers look better on a plate!",
            ],
            pick: [
                "🧺 Tip: Read the recipe first, then gather ingredients!",
                "🧺 Fresh ingredients make the best dishes!",
            ],
        };
        return randomChoice(tips[action] || tips.pick);
    }

    /**
     * Get acceptance rate
     */
    getAcceptanceRate() {
        if (this.totalSuggestions === 0) return 0;
        return this.acceptedSuggestions / this.totalSuggestions;
    }

    getDetailedStats() {
        return {
            qTable: this.qTable.getStats(),
            totalSuggestions: this.totalSuggestions,
            acceptedSuggestions: this.acceptedSuggestions,
            acceptanceRate: `${(this.getAcceptanceRate() * 100).toFixed(1)}%`,
            suggestedVariations: Object.fromEntries(
                Object.entries(this.suggestedVariations).map(([k, v]) => [k, [...v]])
            ),
        };
    }
}

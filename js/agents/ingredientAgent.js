/* ============================================
   ingredientAgent.js — Ingredient Selection Agent
   Phase 2: smarter substitutions, ingredient prioritization,
   category awareness, confidence scoring
   ============================================ */

import { QTable, REWARDS } from '../qLearning.js';

export class IngredientAgent {
    constructor() {
        this.qTable = new QTable({ alpha: 0.15, gamma: 0.85, epsilon: 0.3 });
        this.name = 'IngredientAgent';
        // Track ingredient usage history for prioritization
        this.usageHistory = {}; // ingredientName → { correct: n, wrong: n }
    }

    /**
     * Observe the kitchen and recipe, recommend an ingredient
     */
    recommend(recipeStep, available) {
        if (!recipeStep || !recipeStep.ingredient) return null;

        const state = `step_${recipeStep.action}_needs_${recipeStep.ingredient}`;
        const actions = available.map(i => i.name);

        const chosen = this.qTable.selectAction(state, actions);
        const qVal = this.qTable.getQ(state, chosen);
        const confidence = Math.min(1, Math.max(0.1, 0.5 + qVal / 10));

        return { ingredient: chosen, confidence, isCorrect: chosen === recipeStep.ingredient };
    }

    /**
     * Prioritize ingredients by category relevance to the recipe
     */
    prioritize(recipeSteps, available) {
        const needed = new Set();
        recipeSteps.forEach(s => { if (s.ingredient) needed.add(s.ingredient); });

        return available
            .map(ing => ({
                ...ing,
                priority: needed.has(ing.name) ? 2 : (this._getCategoryRelevance(ing.category) || 0),
                isNeeded: needed.has(ing.name),
            }))
            .sort((a, b) => b.priority - a.priority);
    }

    _getCategoryRelevance(category) {
        // Categories frequency in recipes
        const relevance = { dairy: 1.2, fruit: 1.1, veggie: 1.0, dry: 0.9, grain: 0.8, sweet: 0.7, spice: 0.6 };
        return relevance[category] || 0.5;
    }

    /**
     * Learn from the result of using an ingredient
     */
    learn(recipeStep, chosenIngredient, wasCorrect, available) {
        const state = `step_${recipeStep.action}_needs_${recipeStep.ingredient}`;
        const nextState = 'post_pick';
        const nextActions = available.map(i => i.name);

        const reward = wasCorrect ? REWARDS.GOOD_INGREDIENT : REWARDS.WASTED_INGREDIENT;
        this.qTable.update(state, chosenIngredient, reward, nextState, nextActions);

        // Track history
        if (!this.usageHistory[chosenIngredient]) {
            this.usageHistory[chosenIngredient] = { correct: 0, wrong: 0 };
        }
        if (wasCorrect) this.usageHistory[chosenIngredient].correct++;
        else this.usageHistory[chosenIngredient].wrong++;
    }

    /**
     * Smarter substitution with category matching
     */
    suggestSubstitute(requiredIngredient, available, allIngredients) {
        // Direct substitutions
        const directSubs = {
            'Milk': ['Cream', 'Butter'],
            'Butter': ['Cream', 'Milk'],
            'Sugar': ['Honey', 'Chocolate'],
            'Honey': ['Sugar'],
            'Egg': ['Banana'],
            'Flour': ['Bread'],
            'Bread': ['Flour'],
            'Apple': ['Banana', 'Strawberry', 'Blueberry'],
            'Banana': ['Apple', 'Strawberry', 'Blueberry'],
            'Strawberry': ['Banana', 'Apple', 'Blueberry'],
            'Blueberry': ['Strawberry', 'Banana', 'Apple'],
            'Tomato': ['Onion', 'Pepper'],
            'Onion': ['Garlic', 'Tomato'],
            'Garlic': ['Onion'],
            'Lemon': ['Apple'],
            'Cream': ['Milk', 'Butter'],
            'Vanilla': ['Sugar', 'Honey'],
            'Cheese': ['Butter', 'Cream'],
            'PeanutButter': ['Butter', 'Honey'],
            'Pepper': ['Salt', 'Garlic'],
        };

        // Try direct substitutions first
        const possibleSubs = directSubs[requiredIngredient] || [];
        for (const sub of possibleSubs) {
            if (available.find(a => a.name === sub && a.quantity > 0)) {
                return { name: sub, reason: 'direct substitute' };
            }
        }

        // Fall back to same-category substitution
        const requiredDef = allIngredients.find(i => i.name === requiredIngredient);
        if (requiredDef) {
            const sameCat = available.find(a => a.category === requiredDef.category && a.quantity > 0 && a.name !== requiredIngredient);
            if (sameCat) {
                return { name: sameCat.name, reason: 'same category' };
            }
        }

        return null;
    }

    /**
     * Get ingredient recommendation message with emoji
     */
    getRecommendationMessage(recipeStep, available) {
        const rec = this.recommend(recipeStep, available);
        if (!rec) return null;

        const ing = available.find(a => a.name === rec.ingredient);
        const emoji = ing?.emoji || '📦';

        if (rec.isCorrect) {
            const msgs = [
                `${emoji} Grab the ${rec.ingredient}!`,
                `${emoji} ${rec.ingredient} is next!`,
                `${emoji} I see ${rec.ingredient} — perfect choice!`,
                `${emoji} Let's use ${rec.ingredient}!`,
            ];
            return msgs[Math.floor(Math.random() * msgs.length)];
        }

        return `🤔 Hmm, I think we need ${recipeStep.ingredient}...`;
    }

    /** Get learning statistics */
    getDetailedStats() {
        return {
            qTable: this.qTable.getStats(),
            usageHistory: this.usageHistory,
            totalLearnings: this.qTable.updateCount,
        };
    }
}

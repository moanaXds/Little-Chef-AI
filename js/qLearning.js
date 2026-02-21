/* ============================================
   qLearning.js — Generic Q-Learning Engine
   ============================================ */

export class QTable {
    /**
     * @param {Object} opts
     * @param {number} opts.alpha - Learning rate (0-1), default 0.1
     * @param {number} opts.gamma - Discount factor (0-1), default 0.9
     * @param {number} opts.epsilon - Exploration rate (0-1), default 0.3
     * @param {number} opts.epsilonDecay - Epsilon decay per update, default 0.995
     * @param {number} opts.epsilonMin - Minimum epsilon, default 0.05
     */
    constructor(opts = {}) {
        this.alpha = opts.alpha ?? 0.1;
        this.gamma = opts.gamma ?? 0.9;
        this.epsilon = opts.epsilon ?? 0.3;
        this.epsilonDecay = opts.epsilonDecay ?? 0.995;
        this.epsilonMin = opts.epsilonMin ?? 0.05;
        this.table = {};  // { "state|action": qValue }
        this.updateCount = 0;
    }

    /** Get the Q-value for a state-action pair */
    _key(state, action) {
        return `${state}|${action}`;
    }

    getQ(state, action) {
        return this.table[this._key(state, action)] ?? 0;
    }

    /** Get all Q-values for a given state across provided actions */
    getQValues(state, actions) {
        return actions.map(a => ({ action: a, q: this.getQ(state, a) }));
    }

    /**
     * Select action using ε-greedy policy
     * @param {string} state
     * @param {string[]} actions - available actions
     * @returns {string} selected action
     */
    selectAction(state, actions) {
        if (actions.length === 0) return null;
        if (Math.random() < this.epsilon) {
            // Explore: random action
            return actions[Math.floor(Math.random() * actions.length)];
        }
        // Exploit: best Q-value
        let bestAction = actions[0];
        let bestQ = this.getQ(state, actions[0]);
        for (let i = 1; i < actions.length; i++) {
            const q = this.getQ(state, actions[i]);
            if (q > bestQ) {
                bestQ = q;
                bestAction = actions[i];
            }
        }
        return bestAction;
    }

    /**
     * Update Q-value using Q-learning formula:
     * Q(s,a) = Q(s,a) + α * [reward + γ * max(Q(s',a')) - Q(s,a)]
     */
    update(state, action, reward, nextState, nextActions = []) {
        const key = this._key(state, action);
        const currentQ = this.getQ(state, action);

        // Max Q for next state
        let maxNextQ = 0;
        if (nextActions.length > 0) {
            maxNextQ = Math.max(...nextActions.map(a => this.getQ(nextState, a)));
        }

        const newQ = currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ);
        this.table[key] = newQ;

        // Decay exploration
        this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
        this.updateCount++;

        // Log for visualization
        console.log(`[RL] Q(${state}, ${action}) = ${newQ.toFixed(3)} | reward=${reward} | ε=${this.epsilon.toFixed(3)} | updates=${this.updateCount}`);

        return newQ;
    }

    /** Get summary stats */
    getStats() {
        const entries = Object.entries(this.table);
        return {
            totalEntries: entries.length,
            updateCount: this.updateCount,
            epsilon: this.epsilon,
            topEntries: entries
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([key, val]) => ({ key, q: val.toFixed(3) }))
        };
    }
}

/* Reward constants */
export const REWARDS = {
    RECIPE_COMPLETE: 10,
    ON_TIME: 5,
    CREATIVE_ACTION: 3,
    PLAYER_ENGAGED: 2,
    GOOD_INGREDIENT: 2,
    BURNT_DISH: -5,
    WASTED_INGREDIENT: -3,
    WRONG_ACTION: -2,
    LATE: -1,
};

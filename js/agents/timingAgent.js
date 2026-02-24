/* ============================================
   timingAgent.js — Cooking Duration Manager
   Phase 2: granular optimization, burn detection,
   adaptive timing, step-specific messages
   ============================================ */

import { QTable, REWARDS } from '../qLearning.js';
import { randomChoice } from '../utils.js';

export class TimingAgent {
    constructor() {
        this.qTable = new QTable({ alpha: 0.12, gamma: 0.9, epsilon: 0.25 });
        this.name = 'TimingAgent';
        // Track timing history per recipe step type
        this.timingHistory = {}; // "recipe_action" → { attempts, successes, avgDuration }
        this.burnCount = 0;
        this.perfectTimings = 0;
    }

    /**
     * Recommend timing for a step with granular options
     */
    recommend(step, recipeName) {
        if (!step || !step.duration) {
            return { timing: 'instant', seconds: 0, message: '⚡ Quick step!' };
        }

        const state = `${recipeName}_${step.action}_${step.station}_d${step.duration}`;
        const timingActions = ['very_early', 'early', 'perfect', 'late', 'very_late'];
        const chosen = this.qTable.selectAction(state, timingActions);

        const base = step.duration;
        const timingMap = {
            very_early: {
                factor: 0.5, risk: 'undercooked',
                messages: ["⚡ Super quick! But be careful...", "🏎️ Speed mode! Hope it's done..."]
            },
            early: {
                factor: 0.75, risk: 'slightly raw',
                messages: ["⏰ Quick cook! ~" + Math.round(base * 0.75) + "s", "🏃 Fast! About " + Math.round(base * 0.75) + "s should work"]
            },
            perfect: {
                factor: 1.0, risk: null,
                messages: ["⏰ Perfect timing: ~" + base + "s! 🎯", "✨ Just right: " + base + " seconds!", "👌 " + base + "s — that's the sweet spot!"]
            },
            late: {
                factor: 1.25, risk: null,
                messages: ["⏰ Take your time: ~" + Math.round(base * 1.25) + "s", "🐢 Nice and slow: " + Math.round(base * 1.25) + "s"]
            },
            very_late: {
                factor: 1.5, risk: 'burnt',
                messages: ["🔥 Careful! That's a long time...", "⚠️ Don't burn it! Watch closely!"]
            },
        };

        const info = timingMap[chosen];
        return {
            timing: chosen,
            seconds: Math.round(base * info.factor * 10) / 10,
            risk: info.risk,
            message: randomChoice(info.messages),
        };
    }

    /**
     * Learn from timing outcome
     */
    learn(recipeName, step, timing, wasSuccessful, actualDuration = null) {
        const state = `${recipeName}_${step.action}_${step.station}_d${step.duration}`;
        const reward = wasSuccessful ? REWARDS.ON_TIME : REWARDS.LATE;
        const nextState = 'post_timing';
        this.qTable.update(state, timing, reward, nextState, ['very_early', 'early', 'perfect', 'late', 'very_late']);

        if (wasSuccessful) this.perfectTimings++;
        else this.burnCount++;

        // Track history
        const key = `${recipeName}_${step.action}`;
        if (!this.timingHistory[key]) {
            this.timingHistory[key] = { attempts: 0, successes: 0, totalDuration: 0 };
        }
        this.timingHistory[key].attempts++;
        if (wasSuccessful) this.timingHistory[key].successes++;
        if (actualDuration) this.timingHistory[key].totalDuration += actualDuration;
    }

    /**
     * Get contextual encouragement based on remaining time
     */
    getEncouragement(remaining, total) {
        const ratio = remaining / total;
        if (ratio > 0.7) {
            return randomChoice(["⏳ Plenty of time!", "😌 No rush!", "🎵 La la la~ cooking away!"]);
        }
        if (ratio > 0.4) {
            return randomChoice(["⏰ Halfway there!", "👀 Keep an eye on it!", "🍳 Smells good!"]);
        }
        if (ratio > 0.15) {
            return randomChoice(["⏰ Almost done!", "🔥 Getting close!", "👃 Mmm, almost ready!"]);
        }
        if (ratio > 0) {
            return randomChoice(["🔥 NOW! Take it off!", "⚡ Quick, it's done!", "🚨 Don't burn it!"]);
        }
        return "✅ Done! Time to move on!";
    }

    /**
     * Predict if the current step might burn based on Q-table history
     */
    getBurnRisk(recipeName, step) {
        if (!step || !step.duration) return 0;
        const state = `${recipeName}_${step.action}_${step.station}_d${step.duration}`;
        const lateQ = this.qTable.getQ(state, 'very_late');
        const perfectQ = this.qTable.getQ(state, 'perfect');
        // Higher burn risk if late has been tried and failed
        return lateQ < -2 ? 0.8 : (perfectQ > 2 ? 0.1 : 0.3);
    }

    getDetailedStats() {
        return {
            qTable: this.qTable.getStats(),
            timingHistory: this.timingHistory,
            burnCount: this.burnCount,
            perfectTimings: this.perfectTimings,
        };
    }
}

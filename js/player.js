/* ============================================
   player.js — Player Controller
   Phase 2: drag-and-drop, skill metrics, rendering
   ============================================ */

export class Player {
    constructor(kitchen) {
        this.kitchen = kitchen;
        this.heldItem = null;     // currently dragged ingredient
        this.dragging = false;
        this.dragItem = null;
        this.dragX = 0;
        this.dragY = 0;
        this.skillMetrics = {
            actionsCompleted: 0,
            mistakes: 0,
            speed: 0,
            _stepTimes: [],
            _lastStepTime: null,
        };
    }

    /** Start dragging an ingredient */
    startDrag(ingredient, x, y) {
        this.dragging = true;
        this.dragItem = { ...ingredient };
        this.heldItem = this.dragItem;
        this.dragX = x;
        this.dragY = y;
    }

    /** Move the dragged item */
    moveDrag(x, y) {
        if (!this.dragging) return;
        this.dragX = x;
        this.dragY = y;
    }

    /** End dragging */
    endDrag() {
        this.dragging = false;
        this.dragItem = null;
        this.heldItem = null;
    }

    /** Record start of a new step */
    startStep() {
        this.skillMetrics._lastStepTime = Date.now();
    }

    /** Record completion of a step */
    completeStep() {
        if (this.skillMetrics._lastStepTime) {
            const elapsed = (Date.now() - this.skillMetrics._lastStepTime) / 1000;
            this.skillMetrics._stepTimes.push(elapsed);
            this.skillMetrics.speed =
                this.skillMetrics._stepTimes.reduce((a, b) => a + b, 0) /
                this.skillMetrics._stepTimes.length;
        }
        this.skillMetrics.actionsCompleted++;
        this.skillMetrics._lastStepTime = Date.now();
    }

    /** Record a mistake */
    recordMistake() {
        this.skillMetrics.mistakes++;
    }

    /** Get skill level string for AI strategy agent */
    getSkillLevel() {
        const ratio = this.skillMetrics.mistakes / Math.max(1, this.skillMetrics.actionsCompleted);
        if (ratio > 0.5) return 'struggling';
        if (ratio > 0.2) return 'learning';
        return 'skilled';
    }

    /** Handle click on the kitchen (legacy) */
    handleClick(x, y) {
        const ing = this.kitchen.getIngredientAt(x, y);
        if (ing) {
            this.heldItem = { ...ing };
            return { type: 'pick', ingredient: ing };
        }
        const station = this.kitchen.getStationAt(x, y);
        if (station) {
            return { type: 'station_click', station };
        }
        return null;
    }

    /** Handle drop (legacy) */
    handleDrop(x, y) {
        if (!this.heldItem) return null;
        const station = this.kitchen.getStationAt(x, y);
        if (station && station.id !== 'shelf') {
            const result = { type: 'drop', ingredient: this.heldItem, station };
            this.heldItem = null;
            return result;
        }
        this.heldItem = null;
        return null;
    }

    /** Update (called each frame) */
    update(dt) {
        // Placeholder for future player animations
    }

    /** Render dragged item following cursor */
    render(ctx) {
        if (!this.dragging || !this.dragItem) return;

        ctx.save();
        ctx.translate(this.dragX, this.dragY);

        // Dynamic tilt based on movement speed
        const currentX = this.dragX;
        if (this.lastDragX === undefined) this.lastDragX = currentX;
        const dx = currentX - this.lastDragX;
        this.lastDragX = currentX;

        const tilt = Math.max(-0.2, Math.min(0.2, dx * 0.01));
        ctx.rotate(tilt);
        ctx.scale(1.15, 1.15);

        // Shadow
        ctx.globalAlpha = 0.3;
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.dragItem.emoji || '📦', 4, 14);

        // Item itself
        ctx.globalAlpha = 1;
        ctx.fillText(this.dragItem.emoji || '📦', 0, 0);

        // Name tag
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.strokeText(this.dragItem.name, 0, 28);
        ctx.fillText(this.dragItem.name, 0, 28);

        ctx.restore();
    }

    reset() {
        this.heldItem = null;
        this.dragging = false;
        this.dragItem = null;
        this.skillMetrics = {
            actionsCompleted: 0,
            mistakes: 0,
            speed: 0,
            _stepTimes: [],
            _lastStepTime: null,
        };
    }
}

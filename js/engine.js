/* ============================================
   engine.js — Game Engine
   60fps loop, input management, scene states
   ============================================ */

import { pointInRect } from './utils.js';

/** Game states */
export const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    RESULT: 'RESULT',
};

/**
 * GameEngine — core loop, input, rendering
 */
export class GameEngine {
    constructor(canvasOrId) {
        this.canvas = typeof canvasOrId === 'string'
            ? document.getElementById(canvasOrId)
            : canvasOrId;
        this.ctx = this.canvas.getContext('2d');
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.running = false;
        this.scenes = {};       // { stateName: { update, render } }
        this.entities = [];     // objects with update(dt) and render(ctx)

        // Callback hooks (used by main.js)
        this.onUpdate = null;    // (dt) => void
        this.onRender = null;    // (ctx) => void
        this.onClick = null;     // (x, y) => void
        this.onDragStart = null; // (x, y) => void
        this.onDragMove = null;  // (x, y) => void
        this.onDragEnd = null;   // (x, y) => void

        // Input state
        this.mouse = { x: 0, y: 0, down: false, clicked: false, dragging: false };
        this.dragStart = null;
        this.dragPayload = null; // what's being dragged

        // Canvas sizing
        this.WIDTH = 1024;
        this.HEIGHT = 640;

        this._setupCanvas();
        this._setupInput();
    }

    /** Setup canvas size */
    _setupCanvas() {
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.width = `${this.WIDTH}px`;
        this.canvas.style.height = `${this.HEIGHT}px`;

        // Responsive scaling
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const maxW = window.innerWidth * 0.95;
        const maxH = window.innerHeight * 0.92;
        const scale = Math.min(maxW / this.WIDTH, maxH / this.HEIGHT);
        this.canvas.style.width = `${this.WIDTH * scale}px`;
        this.canvas.style.height = `${this.HEIGHT * scale}px`;
        this.scale = scale;
    }

    /** Convert page coords to canvas coords */
    _pageToCanvas(pageX, pageY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (pageX - rect.left) / this.scale,
            y: (pageY - rect.top) / this.scale,
        };
    }

    /** Setup mouse input events */
    _setupInput() {
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this._pageToCanvas(e.clientX, e.clientY);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
            if (this.mouse.down && this.dragStart) {
                const dx = pos.x - this.dragStart.x;
                const dy = pos.y - this.dragStart.y;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    this.mouse.dragging = true;
                }
                if (this.mouse.dragging && this.onDragMove) {
                    this.onDragMove(pos.x, pos.y);
                }
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this._pageToCanvas(e.clientX, e.clientY);
            this.mouse.down = true;
            this.mouse.clicked = true;
            this.dragStart = { x: pos.x, y: pos.y };
            if (this.onDragStart) this.onDragStart(pos.x, pos.y);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const pos = this._pageToCanvas(e.clientX, e.clientY);
            if (this.mouse.dragging) {
                if (this.onDragEnd) this.onDragEnd(pos.x, pos.y);
            } else if (this.mouse.clicked || !this.mouse.dragging) {
                // It was a click, not a drag
                if (this.onClick) this.onClick(pos.x, pos.y);
            }
            this.mouse.down = false;
            this.mouse.dragging = false;
            this.dragStart = null;
            if (this.dragPayload) {
                this._onDrop();
            }
            this.dragPayload = null;
        });

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const pos = this._pageToCanvas(touch.clientX, touch.clientY);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
            this.mouse.down = true;
            this.mouse.clicked = true;
            this.dragStart = { x: pos.x, y: pos.y };
            if (this.onDragStart) this.onDragStart(pos.x, pos.y);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const pos = this._pageToCanvas(touch.clientX, touch.clientY);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
            this.mouse.dragging = true;
            if (this.onDragMove) this.onDragMove(pos.x, pos.y);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            const pos = e.changedTouches?.[0]
                ? this._pageToCanvas(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
                : { x: this.mouse.x, y: this.mouse.y };
            if (this.mouse.dragging) {
                if (this.onDragEnd) this.onDragEnd(pos.x, pos.y);
            } else {
                if (this.onClick) this.onClick(pos.x, pos.y);
            }
            this.mouse.down = false;
            this.mouse.dragging = false;
            this.dragStart = null;
            if (this.dragPayload) this._onDrop();
            this.dragPayload = null;
        });
    }

    _onDrop() {
        // Will be overridden by game logic
    }

    /** Register a scene for a game state */
    registerScene(stateName, scene) {
        this.scenes[stateName] = scene;
    }

    /** Change game state */
    setState(newState) {
        console.log(`[Engine] State: ${this.state} → ${newState}`);
        this.state = newState;
        if (this.scenes[newState]?.enter) {
            this.scenes[newState].enter();
        }
    }

    /** Start the game loop */
    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this._loop(t));
    }

    /** Core game loop */
    _loop(timestamp) {
        if (!this.running) return;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap dt
        this.lastTime = timestamp;

        this._update(dt);
        this._render();

        // Reset per-frame input flags
        this.mouse.clicked = false;

        requestAnimationFrame((t) => this._loop(t));
    }

    _update(dt) {
        // Callback-based update (used by main.js)
        if (this.onUpdate) this.onUpdate(dt);

        const scene = this.scenes[this.state];
        if (scene?.update) scene.update(dt, this);

        this.entities.forEach(e => {
            if (e.update) e.update(dt, this);
        });
    }

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        // Callback-based render (used by main.js)
        if (this.onRender) this.onRender(ctx);

        const scene = this.scenes[this.state];
        if (scene?.render) scene.render(ctx, this);

        this.entities.forEach(e => {
            if (e.render) e.render(ctx, this);
        });
    }

    /** Utility: check if mouse is hovering rect */
    isHovering(rect) {
        return pointInRect(this.mouse.x, this.mouse.y, rect);
    }

    /** Utility: check if mouse clicked inside rect this frame */
    isClicked(rect) {
        return this.mouse.clicked && this.isHovering(rect);
    }
}

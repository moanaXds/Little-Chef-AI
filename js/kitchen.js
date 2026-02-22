/* ============================================
   kitchen.js — Kitchen Environment
   Stations, ingredients, tools, and state
   ============================================ */

import { drawRoundRect } from './utils.js';

/**
 * Ingredient definition
 */
export const INGREDIENTS = [
    { name: 'Flour', emoji: '🌾', category: 'dry' },
    { name: 'Sugar', emoji: '🍬', category: 'dry' },
    { name: 'Egg', emoji: '🥚', category: 'dairy' },
    { name: 'Milk', emoji: '🥛', category: 'dairy' },
    { name: 'Butter', emoji: '🧈', category: 'dairy' },
    { name: 'Tomato', emoji: '🍅', category: 'veggie' },
    { name: 'Onion', emoji: '🧅', category: 'veggie' },
    { name: 'Pasta', emoji: '🍝', category: 'grain' },
    { name: 'Chocolate', emoji: '🍫', category: 'sweet' },
    { name: 'Banana', emoji: '🍌', category: 'fruit' },
    { name: 'Strawberry', emoji: '🍓', category: 'fruit' },
    { name: 'Vanilla', emoji: '🧁', category: 'spice' },
    { name: 'Salt', emoji: '🧂', category: 'spice' },
    { name: 'Cheese', emoji: '🧀', category: 'dairy' },
    { name: 'Apple', emoji: '🍎', category: 'fruit' },
    // Phase 2 ingredients
    { name: 'Rice', emoji: '🍚', category: 'grain' },
    { name: 'Garlic', emoji: '🧄', category: 'veggie' },
    { name: 'Lemon', emoji: '🍋', category: 'fruit' },
    { name: 'Honey', emoji: '🍯', category: 'sweet' },
    { name: 'Bread', emoji: '🍞', category: 'grain' },
    { name: 'Lettuce', emoji: '🥬', category: 'veggie' },
    { name: 'Cream', emoji: '🍦', category: 'dairy' },
    { name: 'Pepper', emoji: '🌶️', category: 'spice' },
    { name: 'Blueberry', emoji: '🫐', category: 'fruit' },
    { name: 'PeanutButter', emoji: '🥜', category: 'sweet' },
];

/**
 * Station definitions
 */
export const STATIONS = {
    SHELF: { id: 'shelf', name: 'Ingredient Shelf', x: 0, y: 480, w: 1024, h: 150, color: '#D4A574' },
    CUTTING: { id: 'cutting', name: 'Cutting Board', x: 40, y: 280, w: 200, h: 160, color: '#C9956B' },
    STOVE: { id: 'stove', name: 'Stove', x: 280, y: 280, w: 200, h: 160, color: '#8B8B8B' },
    MIXER: { id: 'mixer', name: 'Mixer', x: 520, y: 280, w: 200, h: 160, color: '#FFE5CC' },
    PLATE: { id: 'plate', name: 'Plating Area', x: 760, y: 280, w: 220, h: 160, color: '#FFF5EB' },
};

/**
 * Kitchen — manages the full kitchen state
 */
export class Kitchen {
    constructor() {
        this.ingredients = INGREDIENTS.map(ing => ({ ...ing, quantity: 3 }));
        this.stations = { ...STATIONS };
        this.activeItems = {};  // stationId → [items]
        Object.keys(STATIONS).forEach(k => {
            this.activeItems[STATIONS[k].id] = [];
        });

        // Phase 3: Plating Stack
        this.platingStack = [];

        this.tools = ['knife', 'pan', 'spoon', 'bowl', 'whisk'];
    }

    /** Get available ingredients (quantity > 0) */
    getAvailableIngredients() {
        return this.ingredients.filter(i => i.quantity > 0);
    }

    /** Use an ingredient (decrement quantity) */
    useIngredient(name) {
        const ing = this.ingredients.find(i => i.name === name);
        if (ing && ing.quantity > 0) {
            ing.quantity--;
            return true;
        }
        return false;
    }

    /** Place an item at a station */
    placeAtStation(stationId, item) {
        // Plating Area: Stack items
        if (stationId === 'plate') {
            const platedItem = { ...item, yOffset: -10, scale: 1.1 }; // Start with bounce
            this.platingStack.push(platedItem);
            return true;
        }

        // Prep Stations: Single item only
        if (this.activeItems[stationId].length === 0) {
            // Add state tracking
            const stationItem = {
                ...item,
                processed: false,
                progress: 0,
                maxProgress: 100,
                isCooking: false
            };
            this.activeItems[stationId].push(stationItem);
            return true;
        }
        return false;
    }

    /** Get items at a station */
    getStationItems(stationId) {
        return this.activeItems[stationId] || [];
    }

    /** Clear a station */
    clearStation(stationId) {
        if (stationId === 'plate') {
            this.platingStack = [];
        } else {
            this.activeItems[stationId] = [];
        }
    }

    /** Reset all ingredients to full */
    reset() {
        this.ingredients = INGREDIENTS.map(ing => ({ ...ing, quantity: 3 }));
        Object.keys(STATIONS).forEach(k => {
            this.activeItems[STATIONS[k].id] = [];
        });
    }

    /**
     * Render kitchen background and stations
     */
    render(ctx, mouseX = 0, mouseY = 0) {
        const hoveredStation = this.getStationAt(mouseX, mouseY);
        const hoveredStationId = hoveredStation ? hoveredStation.id : null;

        // Kitchen wall
        ctx.fillStyle = '#FFF0DB';
        ctx.fillRect(0, 0, 1024, 430);

        // ... existing background code ...
        // Kitchen floor
        const floorGrad = ctx.createLinearGradient(0, 430, 0, 640);
        floorGrad.addColorStop(0, '#E8C9A0');
        floorGrad.addColorStop(1, '#D4B08C');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, 430, 1024, 210);

        // Counter top
        ctx.fillStyle = '#D4A574';
        ctx.fillRect(0, 420, 1024, 20);
        ctx.fillStyle = '#B8895A';
        ctx.fillRect(0, 425, 1024, 4);

        // Wall tiles pattern
        ctx.strokeStyle = 'rgba(212, 165, 116, 0.15)';
        ctx.lineWidth = 1;
        for (let y = 20; y < 420; y += 40) {
            for (let x = (Math.floor(y / 40) % 2) * 30; x < 1024; x += 60) {
                ctx.strokeRect(x, y, 60, 40);
            }
        }

        // Wall shelf decoration
        ctx.fillStyle = '#C9956B';
        ctx.fillRect(30, 120, 960, 8);
        ctx.fillStyle = '#B8895A';
        ctx.fillRect(30, 128, 960, 3);

        // Workflow Path (Connecting Stations)
        ctx.beginPath();
        // Centers of stations: (156+80, 200+60), (340+80, 200+60), etc.
        // Y = 260.
        // X = 236 -> 420 -> 604 -> 788.
        ctx.moveTo(236, 260);
        ctx.lineTo(788, 260);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; // Shadow/Groove
        ctx.lineWidth = 12;
        ctx.setLineDash([15, 15]);
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF'; // White dash
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Render stations
        this._renderStation(ctx, STATIONS.CUTTING, '🔪', hoveredStationId === 'cutting');
        this._renderStation(ctx, STATIONS.STOVE, '🔥', hoveredStationId === 'stove');
        this._renderStation(ctx, STATIONS.MIXER, '🥣', hoveredStationId === 'mixer');
        this._renderPlating(ctx, STATIONS.PLATE, hoveredStationId === 'plate');

        // Render ingredient shelf (PASS ACTIONABLE MOUSE COORDS)
        this._renderShelf(ctx, mouseX, mouseY);
    }

    _renderStation(ctx, station, icon, isHovered = false) {
        // Hover Glow
        if (isHovered) {
            ctx.save();
            ctx.shadowColor = '#FFD93D';
            ctx.shadowBlur = 25;
            drawRoundRect(ctx, station.x - 2, station.y - 2, station.w + 4, station.h + 4, 18);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.restore();
        }

        // Station background
        drawRoundRect(ctx, station.x, station.y, station.w, station.h, 16);
        ctx.fillStyle = station.color;
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered ? '#FFD93D' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = isHovered ? 4 : 2;
        ctx.stroke();

        // Subtle shadow
        drawRoundRect(ctx, station.x + 4, station.y + station.h - 8, station.w - 8, 8, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fill();

        // Station icon (Animated for Stove)
        ctx.save();
        let scale = 1;
        if (station.id === 'stove') {
            scale = 1 + Math.sin(Date.now() / 150) * 0.15; // Breathing fire effect
        }
        const cx = station.x + station.w / 2;
        const cy = station.y + 50;

        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.font = '36px serif';
        ctx.textAlign = 'center';
        ctx.fillText(icon, 0, 0);
        ctx.restore();

        // Station name
        ctx.font = '13px "Outfit", sans-serif';
        ctx.fillStyle = '#7A6363';
        ctx.textAlign = 'center';
        ctx.fillText(station.name, station.x + station.w / 2, station.y + station.h - 12);

        // Items placed at this station
        const items = this.activeItems[station.id];
        if (items && items.length > 0) {
            const item = items[0];

            // Draw Item
            ctx.font = '32px serif';
            ctx.fillText(item.emoji || '📦', cx, cy + 10);

            // Draw Progress Bar if processing
            if (item.progress > 0 && !item.processed) {
                const bw = 120, bh = 10;
                const bx = station.x + (station.w - bw) / 2;
                const by = station.y + 110;

                drawRoundRect(ctx, bx, by, bw, bh, 5);
                ctx.fillStyle = '#DDD';
                ctx.fill();

                const progressW = (item.progress / item.maxProgress) * bw;
                drawRoundRect(ctx, bx, by, progressW, bh, 5);
                ctx.fillStyle = item.isCooking ? '#FF6B6B' : '#6BCB77'; // Red for partial, Green for done? Or Red for heat.
                ctx.fill();
            }

            // Draw Action Button (if not processing and not done)
            if (!item.isCooking && !item.processed) {
                let label = 'ACT';
                let btnColor = '#6BCB77';
                if (station.id === 'cutting') { label = 'CUT'; btnColor = '#FF6B6B'; }
                if (station.id === 'stove') { label = 'COOK'; btnColor = '#FF9A9A'; }
                if (station.id === 'mixer') { label = 'MIX'; btnColor = '#4D96FF'; }

                const btnW = 80, btnH = 30;
                const btnX = station.x + (station.w - btnW) / 2;
                const btnY = station.y + 100;

                // Button rect for hit test (store it on station temporarily or item?)
                station._actionBtn = { x: btnX, y: btnY, w: btnW, h: btnH, label };

                // Pulse effect
                const pulse = Math.sin(Date.now() / 200) * 2;

                drawRoundRect(ctx, btnX - pulse / 2, btnY - pulse / 2, btnW + pulse, btnH + pulse, 8);
                ctx.fillStyle = btnColor;
                ctx.fill();
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.font = 'bold 14px "Outfit", sans-serif';
                ctx.fillStyle = '#FFF';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, btnX + btnW / 2, btnY + btnH / 2);
            } else {
                station._actionBtn = null;
            }

            if (item.processed) {
                ctx.font = '24px serif';
                ctx.fillText('✅', cx + 20, cy - 20);
                station._actionBtn = null;
            }
        } else {
            station._actionBtn = null;
        }
    }

    _renderPlating(ctx, station, isHovered) {
        // Base plate background
        drawRoundRect(ctx, station.x, station.y, station.w, station.h, 16);
        ctx.fillStyle = station.color;
        ctx.fill();

        ctx.strokeStyle = isHovered ? '#FFD93D' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = isHovered ? 4 : 2;
        ctx.stroke();

        ctx.font = '13px "Outfit", sans-serif';
        ctx.fillStyle = '#7A6363';
        ctx.textAlign = 'center';
        ctx.fillText(station.name, station.x + station.w / 2, station.y + station.h - 12);

        // Center Plate Graphic
        const catX = station.x + station.w / 2;
        const catY = station.y + station.h / 2 + 10;

        ctx.beginPath();
        ctx.ellipse(catX, catY, 70, 25, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.fill();
        ctx.strokeStyle = '#EEE';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.platingStack.length === 0) {
            ctx.font = 'italic 12px serif';
            ctx.fillStyle = '#AAA';
            ctx.fillText("Ready to plate!", catX, catY);
            return;
        }

        // Render Stack
        this.platingStack.forEach((item, i) => {
            // Bounce animation
            if (item.yOffset < 0) {
                item.yOffset += 1; // simple gravity simulation per frame (approx)
            }

            const yPos = catY + item.yOffset - (i * 8); // Stack upwards

            ctx.save();
            ctx.translate(catX, yPos);
            if (item.scale) ctx.scale(item.scale, item.scale);

            ctx.font = '32px serif';
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 5;
            ctx.fillText(item.emoji, 0, 0);

            ctx.restore();
        });

        // Dish Name
        if (this.platingStack.length > 0) {
            // Simple dynamic name logic
            const main = this.platingStack[0].name;
            const last = this.platingStack[this.platingStack.length - 1].name;
            let name = main;
            if (this.platingStack.length > 1) name += ` with ${last}`;

            ctx.font = 'bold 14px "Bubblegum Sans", cursive';
            ctx.fillStyle = '#FF6B6B';
            ctx.fillText(name, catX, station.y + 20);
        }
    }

    _renderShelf(ctx, mouseX, mouseY) {
        const shelf = STATIONS.SHELF;

        // Shelf background
        drawRoundRect(ctx, shelf.x, shelf.y, shelf.w, shelf.h, 16);
        const shelfGrad = ctx.createLinearGradient(shelf.x, shelf.y, shelf.x, shelf.y + shelf.h);
        shelfGrad.addColorStop(0, '#E8D5C0');
        shelfGrad.addColorStop(1, '#D4A574');
        ctx.fillStyle = shelfGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = 'bold 14px "Outfit", sans-serif';
        ctx.fillStyle = '#7A6363';
        ctx.textAlign = 'left';
        ctx.fillText('🧺 Ingredients', shelf.x + 12, shelf.y + 20);

        // Ingredient icons
        const ingredients = this.ingredients; // FIXED: Use all items
        const itemW = 64;
        const itemH = 64;
        const gapX = 0;
        const gapY = 8;
        const row1Count = 16;
        const startX = 0 + (1024 - (row1Count * itemW)) / 2;
        const startY = shelf.y + 30;

        ingredients.forEach((ing, i) => {
            let col, row;
            if (i < row1Count) {
                col = i;
                row = 0;
            } else {
                col = i - row1Count;
                row = 1;
            }

            const ix = startX + col * (itemW + gapX);
            const iy = startY + row * (itemH + gapY);

            // Hover check
            const isHovered = mouseX >= ix && mouseX <= ix + itemW &&
                mouseY >= iy && mouseY <= iy + itemH;

            // Save rect for hit detection
            ing._rect = { x: ix, y: iy, w: itemW, h: itemH };

            ctx.save();
            ctx.translate(ix + itemW / 2, iy + itemH / 2);

            if (isHovered && ing.quantity > 0) {
                ctx.scale(1.05, 1.05);
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 10;
            }

            // Alpha for empty
            if (ing.quantity <= 0) ctx.globalAlpha = 0.5;

            // Slot Background
            drawRoundRect(ctx, -itemW / 2, -itemH / 2, itemW - 4, itemH - 4, 10);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fill();
            ctx.strokeStyle = (isHovered && ing.quantity > 0) ? '#FFF' : 'rgba(0,0,0,0.06)';
            ctx.lineWidth = (isHovered && ing.quantity > 0) ? 2 : 1;
            ctx.stroke();

            // Emoji
            ctx.font = '32px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ing.emoji, 0, -4);

            // Name
            ctx.font = '10px "Outfit", sans-serif';
            ctx.fillStyle = '#5A4040';
            ctx.fillText(ing.name, 0, 20);

            // Quantity Badge
            if (ing.quantity > 0) {
                const bx = itemW / 2 - 12;
                const by = -itemH / 2 + 12;
                ctx.beginPath();
                ctx.arc(bx, by, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#FF6B6B';
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 9px sans-serif';
                ctx.fillText(ing.quantity, bx, by + 3);
            }

            ctx.restore();
        });
    }

    /** Get ingredient at screen position */
    getIngredientAt(x, y) {
        const available = this.getAvailableIngredients();
        for (const ing of available) {
            if (ing._rect && x >= ing._rect.x && x <= ing._rect.x + ing._rect.w &&
                y >= ing._rect.y && y <= ing._rect.y + ing._rect.h) {
                return ing;
            }
        }
        return null;
    }

    /** Get station at screen position */
    getStationAt(x, y) {
        for (const key of Object.keys(STATIONS)) {
            const s = STATIONS[key];
            if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
                return s;
            }
        }
        return null;
    }
}

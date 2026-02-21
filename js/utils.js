/* ============================================
   utils.js — Helper Utilities
   Phase 2: cooking animations, sound engine,
   enhanced particles, progression storage
   ============================================ */

/** Linear interpolation */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Clamp value between min and max */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Pick a random element from array */
export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random integer between min (inclusive) and max (exclusive) */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/** Simple easing — ease out cubic */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Ease in-out */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Check if point (px,py) is inside rect {x,y,w,h} */
export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w &&
    py >= rect.y && py <= rect.y + rect.h;
}

/** Draw rounded rectangle on canvas */
export function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================
// SpeechBubble — animated text
// ============================
export class SpeechBubble {
  constructor(text, x, y, duration = 3000) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.elapsed = 0;
    this.charIndex = 0;
    this.alive = true;
    this.opacity = 1;
  }

  update(dt) {
    this.elapsed += dt * 1000;
    this.charIndex = Math.min(this.text.length, Math.floor(this.elapsed / 30));
    if (this.elapsed > this.duration - 500) {
      this.opacity = Math.max(0, (this.duration - this.elapsed) / 500);
    }
    if (this.elapsed >= this.duration) {
      this.alive = false;
    }
  }

  render(ctx) {
    if (!this.alive) return;
    const displayText = this.text.substring(0, this.charIndex);
    const padding = 12;
    const maxWidth = 220;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = '16px "Bubblegum Sans", cursive';

    const metrics = ctx.measureText(displayText);
    const textWidth = Math.min(metrics.width, maxWidth);
    const boxW = textWidth + padding * 2;
    const boxH = 36;

    drawRoundRect(ctx, this.x - boxW / 2, this.y - boxH, boxW, boxH, 12);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.x - 8, this.y);
    ctx.lineTo(this.x + 8, this.y);
    ctx.lineTo(this.x, this.y + 10);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3D2C2C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, this.x, this.y - boxH / 2, maxWidth);

    ctx.restore();
  }
}

// ============================
// Particle — sparkle / celebration
// ============================
// ============================
// Particle — Enhanced
// ============================
export class Particle {
  constructor(x, y, type = 'default', color = '#FFD93D') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.age = 0;
    this.life = 1.0;
    this.alive = true;

    // Default physics
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -Math.random() * 5 - 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
    this.size = Math.random() * 6 + 2;
    this.gravity = 0.15;

    // Type overrides
    if (type === 'steam') {
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = -Math.random() * 2 - 1;
      this.gravity = -0.02; // Float up
      this.life = 1.5;
      this.size = Math.random() * 10 + 5;
      this.color = '#FFFFFF';
    } else if (type === 'crumb') {
      this.size = Math.random() * 3 + 2;
      this.gravity = 0.4;
      this.vy = Math.random() * -3; // Pop up then fall
      this.color = '#D4A574';
    } else if (type === 'sparkle') {
      this.gravity = 0;
      this.vx *= 0.5;
      this.vy *= 0.5;
      this.rotSpeed = 0.1;
    }
  }

  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.rotation += this.rotSpeed;
    this.age += dt;
    this.life -= dt; // Simple linear decay override if needed

    if (this.type === 'steam') {
      this.life -= dt * 0.3; // Slower fade
      this.size += dt * 5;   // Expand
    }

    if (this.life <= 0) this.alive = false;
  }

  render(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    if (this.type === 'sparkle') {
      // Star shape
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * 0.0174) * this.size,
          Math.sin((18 + i * 72) * 0.0174) * this.size);
        ctx.lineTo(Math.cos((54 + i * 72) * 0.0174) * (this.size / 2),
          Math.sin((54 + i * 72) * 0.0174) * (this.size / 2));
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'steam') {
      // Fuzzy circle
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Default / Crumb (Square/Diamond)
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    ctx.restore();
  }
}

// ============================
// ParticleSystem
// ============================
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count = 10, colors = ['#FFD93D']) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, 'default', randomChoice(colors)));
    }
  }

  emitSteam(x, y) {
    this.particles.push(new Particle(x, y, 'steam'));
  }

  emitCrumbs(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, 'crumb'));
    }
  }

  emitSparkles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, 'sparkle', randomChoice(['#FFD93D', '#FFF', '#6BCB77'])));
    }
  }

  /** Emit mistake particles (red/orange) */
  emitMistake(x, y) {
    this.emit(x, y, 6, ['#FF6B6B', '#FF3333', '#FF9A9A']);
  }

  /** Emit celebration burst */
  emitCelebration(x, y) {
    this.emitSparkles(x, y, 15);
    this.emit(x, y, 15, ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF']);
  }

  /** Emit streak fire */
  emitStreak(x, y) {
    this.emit(x, y, 8, ['#FF6B6B', '#FFD93D']);
    this.emitSparkles(x, y, 4);
  }

  update(dt) {
    this.particles = this.particles.filter(p => p.alive);
    this.particles.forEach(p => p.update(dt));
  }

  render(ctx) {
    this.particles.forEach(p => p.render(ctx));
  }
}

// ============================
// CookingAnimation — visual feedback on stations
// ============================
export class CookingAnimation {
  constructor() {
    this.animations = []; // { type, x, y, timer, duration, ... }
  }

  /** Start a chopping animation at position */
  startChop(x, y) {
    this.animations.push({
      type: 'chop', x, y, timer: 0, duration: 0.6,
      slices: Array.from({ length: 4 }, (_, i) => ({ offset: i * 12 - 18, progress: 0 }))
    });
  }

  /** Start a mixing/stirring animation */
  startMix(x, y) {
    this.animations.push({ type: 'mix', x, y, timer: 0, duration: 2, angle: 0 });
  }

  /** Start a cooking/fire animation */
  startCook(x, y) {
    this.animations.push({
      type: 'cook', x, y, timer: 0, duration: 3,
      flames: Array.from({ length: 5 }, () => ({ offset: (Math.random() - 0.5) * 40, phase: Math.random() * Math.PI * 2 }))
    });
  }

  /** Start a plating animation */
  startPlate(x, y) {
    this.animations.push({ type: 'plate', x, y, timer: 0, duration: 1.0, scale: 0 });
  }

  update(dt) {
    this.animations.forEach(a => { a.timer += dt; });
    this.animations = this.animations.filter(a => a.timer < a.duration);
  }

  render(ctx) {
    this.animations.forEach(a => {
      const t = a.timer / a.duration;
      ctx.save();

      switch (a.type) {
        case 'chop':
          this._renderChop(ctx, a, t);
          break;
        case 'mix':
          this._renderMix(ctx, a, t);
          break;
        case 'cook':
          this._renderCook(ctx, a, t);
          break;
        case 'plate':
          this._renderPlate(ctx, a, t);
          break;
      }

      ctx.restore();
    });
  }

  _renderChop(ctx, a, t) {
    // Knife swings
    const swing = Math.sin(t * Math.PI * 8) * 15;
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(a.x, a.y + swing);
    ctx.rotate(swing * 0.02);
    ctx.fillText('🔪', 0, 0);
    ctx.restore();

    // Cut lines
    ctx.strokeStyle = '#C9956B';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1 - t;
    a.slices.forEach(s => {
      const sliceT = clamp((t * 4 - Math.abs(s.offset) / 20), 0, 1);
      if (sliceT > 0) {
        ctx.beginPath();
        ctx.moveTo(a.x + s.offset, a.y + 15);
        ctx.lineTo(a.x + s.offset, a.y + 15 + 20 * sliceT);
        ctx.stroke();
      }
    });
  }

  _renderMix(ctx, a, t) {
    // Stirring circle
    const angle = t * Math.PI * 6;
    const radius = 15;
    const sx = a.x + Math.cos(angle) * radius;
    const sy = a.y + Math.sin(angle) * radius;

    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥣', sx, sy);

    // Swirl lines
    ctx.strokeStyle = '#FFE5CC';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const a2 = angle - i * 0.3;
      const r = radius - i * 0.5;
      if (r > 0) {
        const px = a.x + Math.cos(a2) * r;
        const py = a.y + Math.sin(a2) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }

  _renderCook(ctx, a, t) {
    // Animated flames
    a.flames.forEach(f => {
      const flameH = 15 + Math.sin(a.timer * 8 + f.phase) * 8;
      const fx = a.x + f.offset;
      const fy = a.y - flameH;

      ctx.font = `${14 + Math.sin(a.timer * 6 + f.phase) * 4}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🔥', fx, fy);
    });

    // Steam
    ctx.globalAlpha = 0.4;
    ctx.font = '16px serif';
    for (let i = 0; i < 3; i++) {
      const steamY = a.y - 30 - (a.timer * 20 + i * 15) % 40;
      const steamX = a.x + Math.sin(a.timer * 3 + i * 2) * 10;
      ctx.fillText('💨', steamX - 15 + i * 15, steamY);
    }
  }

  _renderPlate(ctx, a, t) {
    // Plate appears with scale animation
    const scale = easeOutCubic(Math.min(1, t * 2));
    ctx.translate(a.x, a.y);
    ctx.scale(scale, scale);
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨', 0, 0);

    // Sparkles around
    ctx.globalAlpha = 1 - t;
    for (let i = 0; i < 6; i++) {
      const sa = (i / 6) * Math.PI * 2 + t * 3;
      const sr = 20 + t * 30;
      ctx.font = '12px serif';
      ctx.fillText('✨', Math.cos(sa) * sr, Math.sin(sa) * sr);
    }
  }
}

// ============================
// SceneTransition — smooth fades between scenes
// ============================
export class SceneTransition {
  constructor() {
    this.active = false;
    this.timer = 0;
    this.duration = 0.5;
    this.phase = 'none'; // 'fadeOut', 'fadeIn', 'none'
    this.callback = null;
  }

  /** Start a transition. Calls callback at midpoint. */
  start(callback, duration = 0.5) {
    this.active = true;
    this.timer = 0;
    this.duration = duration;
    this.phase = 'fadeOut';
    this.callback = callback;
  }

  update(dt) {
    if (!this.active) return;
    this.timer += dt;

    if (this.phase === 'fadeOut' && this.timer >= this.duration / 2) {
      this.phase = 'fadeIn';
      if (this.callback) this.callback();
      this.callback = null;
    }

    if (this.timer >= this.duration) {
      this.active = false;
      this.phase = 'none';
    }
  }

  render(ctx, w, h) {
    if (!this.active) return;
    let alpha;
    if (this.phase === 'fadeOut') {
      alpha = (this.timer / (this.duration / 2));
    } else {
      alpha = 1 - ((this.timer - this.duration / 2) / (this.duration / 2));
    }
    alpha = clamp(alpha, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#2D1B14';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ============================
// SoundEngine — Web Audio API simple synth
// ============================
// ============================
// SoundEngine — Procedural Audio (Web Audio API)
// ============================
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this.bgmNodes = [];
    this.isPlayingBgm = false;
  }

  _ensureContext() {
    if (!this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      } catch (e) {
        console.warn('[Sound] Web Audio API not supported');
        this.enabled = false;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.startBgm();
    else this.stopBgm();
    return this.enabled;
  }

  /**
   * Play a procedural sound effect
   */
  _log(name) {
    console.log(`SOUND_PLAYED: ${name}`);
  }

  click() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    this._log('click');

    // High blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  pickup() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    this._log('pickup');

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  drop() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    this._log('drop');

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  success() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    this._log('success');

    // Major triad arpeggio
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.6, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  mistake() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    this._log('mistake');

    // Dissonant saw
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  chop() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    this._log('chop');

    // White noise burst
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();

    // Lowpass filter to make it sound like a "thud"
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    noise.start();
  }

  sizzle() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    // Debounce log to avoid spam
    if (Math.random() < 0.05) this._log('sizzle');

    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    noise.start();
  }

  stir() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    if (Math.random() < 0.1) this._log('stir');

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  celebrate() {
    if (!this.enabled) return;
    this._log('celebrate');
    // Fanfare
    const notes = [523, 659, 784, 1046, 784, 1046];
    const timings = [0, 0.1, 0.2, 0.3, 0.4, 0.5];

    const ctx = this._ensureContext();
    if (!ctx) return;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = freq;

      const t = ctx.currentTime + timings[i];
      gain.gain.setValueAtTime(this.volume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  streakSurge() {
    if (!this.enabled) return;
    this._log('streakSurge');
    const ctx = this._ensureContext();
    if (!ctx) return;

    // Pitch riser
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // ============================
  // Background Music (BGM)
  // ============================
  startBgm() {
    if (!this.enabled || this.isPlayingBgm) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    this.isPlayingBgm = true;
    this._playBgmLoop();
  }

  stopBgm() {
    this.isPlayingBgm = false;
    this.bgmNodes.forEach(n => {
      try { n.stop(); n.disconnect(); } catch (e) { }
    });
    this.bgmNodes = [];
  }

  _playBgmLoop() {
    if (!this.isPlayingBgm) return;
    const ctx = this._ensureContext();

    // Simple lo-fi beat loop (2 bars, 100bpm approx 2.4s)
    // Bass line
    const playBass = (freq, time, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.volume * 0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.start(time);
      osc.stop(time + dur);
      this.bgmNodes.push(osc);
    };

    // Chords (Pad)
    const playChord = (freqs, time, dur) => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.volume * 0.1, time + 0.5);
      gain.gain.linearRampToValueAtTime(0, time + dur);

      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.start(time);
        osc.stop(time + dur);
        this.bgmNodes.push(osc);
      });
    };

    const now = ctx.currentTime;
    const beat = 0.6; // 100bpm

    // Bar 1
    playBass(196, now, beat); // G
    playBass(146, now + beat * 2, beat); // D
    playChord([392, 493, 587], now, beat * 4); // Gmaj

    // Bar 2
    playBass(174, now + beat * 4, beat); // F
    playBass(130, now + beat * 6, beat); // C
    playChord([349, 440, 523], now + beat * 4, beat * 4); // Fmaj

    // Schedule next loop
    setTimeout(() => {
      if (this.isPlayingBgm) this._playBgmLoop();
    }, beat * 8 * 1000 - 50); // slight overlap overlap adjustment
  }
}

// ============================
// ProgressionManager — localStorage high scores & progression
// ============================
export class ProgressionManager {
  constructor(storageKey = 'littleChefAI_progress') {
    this.storageKey = storageKey;
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[Progression] Could not load from localStorage');
    }
    return {
      totalRounds: 0,
      totalScore: 0,
      highScores: {},     // recipeName → { score, stars, time }
      recipesCompleted: {}, // recipeName → count
      achievements: [],
      playerLevel: 1,
    };
  }

  _save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[Progression] Could not save to localStorage');
    }
  }

  /** Record a completed recipe */
  recordCompletion(recipeName, score, stars, time) {
    this.data.totalRounds++;
    this.data.totalScore += score;

    if (!this.data.recipesCompleted[recipeName]) {
      this.data.recipesCompleted[recipeName] = 0;
    }
    this.data.recipesCompleted[recipeName]++;

    // Update high score
    const prev = this.data.highScores[recipeName];
    if (!prev || score > prev.score) {
      this.data.highScores[recipeName] = { score, stars, time };
    }

    // Level up every 5 rounds
    this.data.playerLevel = 1 + Math.floor(this.data.totalRounds / 5);

    // Achievements
    this._checkAchievements(recipeName, score, stars);

    this._save();
  }

  _checkAchievements(recipeName, score, stars) {
    const earned = this.data.achievements;
    if (this.data.totalRounds === 1 && !earned.includes('first_cook')) {
      earned.push('first_cook');
    }
    if (stars === 5 && !earned.includes('perfect_stars')) {
      earned.push('perfect_stars');
    }
    if (this.data.totalRounds >= 10 && !earned.includes('ten_rounds')) {
      earned.push('ten_rounds');
    }
    if (Object.keys(this.data.recipesCompleted).length >= 5 && !earned.includes('five_recipes')) {
      earned.push('five_recipes');
    }
    if (Object.keys(this.data.recipesCompleted).length >= 10 && !earned.includes('ten_recipes')) {
      earned.push('ten_recipes');
    }
    if (score >= 100 && !earned.includes('century_score')) {
      earned.push('century_score');
    }
  }

  /** Get high score for a recipe */
  getHighScore(recipeName) {
    return this.data.highScores[recipeName] || null;
  }

  /** Get all high scores */
  getAllHighScores() {
    return this.data.highScores;
  }

  /** Get player level */
  getPlayerLevel() {
    return this.data.playerLevel;
  }

  /** Get total rounds played */
  getTotalRounds() {
    return this.data.totalRounds;
  }

  /** Get achievements */
  getAchievements() {
    const achievementDefs = {
      first_cook: { name: 'First Cook', emoji: '🍳', desc: 'Complete your first recipe!' },
      perfect_stars: { name: 'Star Chef', emoji: '⭐', desc: 'Get 5 stars on any recipe!' },
      ten_rounds: { name: 'Dedicated Chef', emoji: '🏅', desc: 'Play 10 rounds!' },
      five_recipes: { name: 'Recipe Explorer', emoji: '📖', desc: 'Try 5 different recipes!' },
      ten_recipes: { name: 'Master Chef', emoji: '👨‍🍳', desc: 'Try 10 different recipes!' },
      century_score: { name: 'Century Club', emoji: '💯', desc: 'Score 100+ in a single round!' },
    };
    return this.data.achievements.map(id => achievementDefs[id] || { name: id, emoji: '🏆', desc: '' });
  }

  /** Reset all progress */
  reset() {
    localStorage.removeItem(this.storageKey);
    this.data = this._load();
  }
}

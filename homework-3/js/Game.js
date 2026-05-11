import { CONFIG } from './config.js';
import { Player } from './entities.js';
import { createLevel } from './Level.js';
import { rectCollision, circleCollision } from './Collision.js';
import { ParticleSystem } from './Particles.js';

export class Game {
  constructor(canvas, input, audio, renderer, ui) {
    this.canvas = canvas;
    this.input = input;
    this.audio = audio;
    this.renderer = renderer;
    this.ui = ui;
    this.cachedBackgrounds = [null, null, null];
    this.particles = new ParticleSystem();

    this.state = 'menu';
    this.currentLevel = 0;
    this.score = 0;
    this.lives = CONFIG.MAX_LIVES;
    this.devMode = false;

    this.player = new Player(60, 535);
    this.level = null;
    this.totalCrystals = 0;
    this.collectedCrystals = 0;

    this.lastTime = 0;
    this.bgTrees = [];
    this.bgGenerated = false;
  }

  start() {
    this.audio.init();
    this.ui.init(this);
    this.particles.initDust(40, CONFIG.WIDTH, CONFIG.HEIGHT);
    this._generateBackground(0);
    this._loop(0);
  }

  _loop(timestamp) {
  try {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this.renderer.clear();

    if (this.state === 'playing') this._update(dt);
    if (this.level) this._render();
  } catch (e) {
    console.error('❌ Ошибка в игровом цикле:', e);
  }
  requestAnimationFrame(ts => this._loop(ts));
}

  _update(dt) {
    const result = this.player.update(this.input, this.level.platforms);
    if (result === 'fell') this._killPlayer();

    // Кристаллы
    for (const crystal of this.level.crystals) {
      if (!crystal.collected) {
        const dx = (this.player.x + this.player.w / 2) - crystal.x;
        const dy = (this.player.y + this.player.h / 2) - crystal.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          crystal.collected = true;
          this.collectedCrystals++;
          this.score += 100;
          this.particles.addEffect(crystal.idx);
          this.particles.addSplash(crystal.x, crystal.y);
          this.audio.play('crystal');
          this.ui.updateHUD(this.lives, this.collectedCrystals, this.totalCrystals);
        }
      }
    }

    // Туннель
    if (this.level.tunnel) {
      const t = this.level.tunnel;
      const dx = (this.player.x + this.player.w / 2) - (t.x + t.w / 2);
      const dy = (this.player.y + this.player.h / 2) - (t.y + t.h / 2);
      if (Math.sqrt(dx * dx + dy * dy) < 35) {
        this.audio.play('tunnel');
        this.particles.addTunnelFX(t.x + t.w / 2, t.y + t.h / 2);
        this._winLevel();
      }
    }

    // Враги
    for (const enemy of this.level.enemies) {
      enemy.update();
      if (enemy.alive && rectCollision(this.player, enemy)) {
        this._killPlayer();
      }
    }

    this.particles.update(dt);
  }

  _render() {
    const ctx = this.renderer.ctx;
    const time = Date.now() / 1000;

    this.renderer.drawBackground(this.currentLevel);
    this._drawBGElements();

    for (const p of this.level.platforms) p.draw(ctx);
    for (const c of this.level.crystals) c.draw(ctx, time, this.particles.effects);
    for (const e of this.level.enemies) e.draw(ctx, time);
    if (this.level.tunnel) this._drawTunnel(this.level.tunnel, time);

    this.player.draw(ctx, time);
    this.particles.draw(ctx);
    this.particles.drawDust(ctx);

    if (this.state === 'paused' || this.state === 'stats') {
      this.renderer.drawOverlay();
    }
  }

  _drawBGElements() {
    if (!this.bgGenerated) return;
    const ctx = this.renderer.ctx;
    const t = Date.now() / 1000;
    for (const tree of this.bgTrees) {
      const sway = Math.sin(t * 0.5 + tree.sway) * 3;
      const alpha = tree.layer === 0 ? 0.06 : 0.12;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(tree.x, CONFIG.HEIGHT - tree.h + tree.h * 0.3, tree.w, tree.h * 0.7);
      ctx.beginPath();
      ctx.moveTo(tree.x + sway - tree.w, CONFIG.HEIGHT - tree.h + tree.h * 0.5);
      ctx.lineTo(tree.x + tree.w / 2 + sway, CONFIG.HEIGHT - tree.h);
      ctx.lineTo(tree.x + tree.w * 2 + sway, CONFIG.HEIGHT - tree.h + tree.h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  _drawTunnel(tunnel, time) {
    const ctx = this.renderer.ctx;
    const cx = tunnel.x + tunnel.w / 2;
    const cy = tunnel.y + tunnel.h / 2;
    const r = tunnel.w / 2 + 5;

    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(time * 2) * 0.05;
    ctx.fillStyle = '#4466aa';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.5, '#050510');
    grad.addColorStop(0.8, '#0a0a20');
    grad.addColorStop(1, 'rgba(30,30,80,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      const angle = time * 1.5 + (Math.PI * 2 / 5) * i;
      const or = 12 + Math.sin(time * 2.5 + i) * 4;
      ctx.fillStyle = `rgba(120,140,200,${0.3 + Math.sin(time + i) * 0.15})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * or, cy + Math.sin(angle) * or, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#8899bb';
    ctx.font = '10px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('ТОННЕЛЬ', cx, cy + r + 16);
    ctx.restore();
  }

  _generateBackground(idx) {
    if (this.cachedBackgrounds?.[idx]) {
      this.bgTrees = this.cachedBackgrounds[idx];
      this.bgGenerated = true;
      return;
    }
    const trees = [];
    for (let i = 0; i < 20; i++) {
      trees.push({
        x: (i * 57 + idx * 110) % CONFIG.WIDTH,
        h: 150 + ((i * 31 + idx * 70) % 250),
        w: 15 + ((i * 17 + idx * 30) % 25),
        layer: i % 2,
        sway: i * 0.8
      });
    }
    if (!this.cachedBackgrounds) this.cachedBackgrounds = [];
    this.cachedBackgrounds[idx] = trees;
    this.bgTrees = trees;
    this.bgGenerated = true;
  }

  loadLevel(idx) {
    this.lives = CONFIG.MAX_LIVES;
    this.currentLevel = idx;
    this.level = createLevel(idx);
    this.player.reset(60, 535);
    this.collectedCrystals = 0;
    this.totalCrystals = this.level.crystals.length;
    this.particles.reset();
    this._generateBackground(idx);
    this.ui.updateHUD(this.lives, this.collectedCrystals, this.totalCrystals);
  }

  _killPlayer() {
    if (this.player.invincible > 0) return;
    this.lives--;
    this.ui.updateHUD(this.lives, this.collectedCrystals, this.totalCrystals);

    if (this.lives > 0) {
      this.player.invincible = 2.5;
      this.player.reset(60, 535);
      this.audio.play('hurt');
      this.particles.addHitEffect(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
    } else {
      this.player.alive = false;
      this.audio.play('hurt');
      setTimeout(() => this.ui.showLose(), 600);
    }
  }

  _winLevel() {
    this.player.alive = false;
    setTimeout(() => this.ui.showStats(this.score, this.collectedCrystals, this.totalCrystals, this.currentLevel), 400);
  }

  nextLevel() {
    if (this.currentLevel < 2) {
      this.loadLevel(this.currentLevel + 1);
      this.state = 'story';
      this.ui.showStory(this.level.story);
    } else {
      this.ui.goToMenu();
    }
  }

  setState(state) {
    this.state = state;
    
  }
}
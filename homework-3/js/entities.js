import { CONFIG } from './config.js';
import { rectCollision } from './Collision.js';

export class Player {
  static sprite = null;
  static spriteLoaded = false;

  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = CONFIG.PLAYER.WIDTH; this.h = CONFIG.PLAYER.HEIGHT;
    this.vx = 0; this.vy = 0;
    this.speed = CONFIG.PLAYER.SPEED;
    this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
    this.onGround = false; this.facing = 1;
    this.alive = true; this.invincible = 0;

  
    if (!Player.spriteLoaded) {
      Player.sprite = new Image();
      Player.sprite.src = 'assets/images/hero.png';
      Player.sprite.onload = () => { Player.spriteLoaded = true; };
      Player.sprite.onerror = () => { 
        console.warn('⚠️ Не удалось загрузить assets/images/hero.png. Используется фолбэк.');
        Player.spriteLoaded = true; 
      };
    }
  }

  reset(x, y) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.onGround = false; this.alive = true; this.invincible = 0; this.facing = 1;
  }

  update(input, platforms) {
    if (!this.alive) return;
    if (input.isDown('ArrowLeft', 'KeyA')) { this.vx = -this.speed; this.facing = -1; }
    else if (input.isDown('ArrowRight', 'KeyD')) { this.vx = this.speed; this.facing = 1; }
    else { this.vx *= CONFIG.PLAYER.FRICTION; if (Math.abs(this.vx) < 0.1) this.vx = 0; }
    if (input.isDown('ArrowUp', 'KeyW', 'Space') && this.onGround) { this.vy = this.jumpForce; this.onGround = false; }
    this.vy += CONFIG.GRAVITY;
    this.x += this.vx; this._resolveCollisionsX(platforms);
    this.y += this.vy; this.onGround = false; this._resolveCollisionsY(platforms);
    if (this.x < 0) { this.x = 0; this.vx = 0; }
    if (this.x + this.w > CONFIG.WIDTH) { this.x = CONFIG.WIDTH - this.w; this.vx = 0; }
    if (this.y > CONFIG.HEIGHT + 100) return 'fell';
    if (this.invincible > 0) this.invincible -= 1/60;
    return null;
  }

  _resolveCollisionsX(platforms) {
    for (const p of platforms) { if (rectCollision(this, p)) { if (this.vx > 0) this.x = p.x - this.w; else if (this.vx < 0) this.x = p.x + p.w; this.vx = 0; } }
  }
  _resolveCollisionsY(platforms) {
    for (const p of platforms) { if (rectCollision(this, p)) { if (this.vy > 0) { this.y = p.y - this.h; this.vy = 0; this.onGround = true; } else if (this.vy < 0) { this.y = p.y + p.h; this.vy = 0; } } }
  }

  draw(ctx, time) {
    if (!this.alive) return;
  
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;


    if (!Player.spriteLoaded) {
      ctx.fillStyle = '#3366aa';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      return;
    }

    ctx.save();

    if (this.facing === -1) {
      ctx.translate(this.x + this.w, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(Player.sprite, 0, 0, this.w, this.h);
    } else {
      ctx.drawImage(Player.sprite, this.x, this.y, this.w, this.h);
    }
    ctx.restore();
  }
}

export class Enemy {
  constructor(data) { Object.assign(this, data); }
  update() { if (!this.alive) return; this.x += this.dir * this.speed; if (this.x <= this.minX || this.x + this.w >= this.maxX) this.dir *= -1; }
  draw(ctx, time) {
    if (!this.alive) return;
    const cx = this.x + this.w/2, cy = this.y + this.h/2, r = this.w/2, pulse = Math.sin(time*4)*0.15 + 0.85;
    ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = '#ff2222'; ctx.beginPath(); ctx.arc(cx, cy, r+8, 0, Math.PI*2); ctx.fill(); ctx.restore();
    const grad = ctx.createRadialGradient(cx-r*0.2, cy-r*0.2, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(220,50,50,${pulse})`); grad.addColorStop(0.7, `rgba(160,20,20,${pulse})`); grad.addColorStop(1, `rgba(80,10,10,${pulse})`);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,80,80,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(cx-5, cy-3, 4, 0, Math.PI*2); ctx.arc(cx+5, cy-3, 4, 0, Math.PI*2); ctx.fill();
  }
}

export class Crystal {
  constructor(x, y, idx) { this.x = x; this.y = y; this.idx = idx; this.collected = false; this.w = 14; this.h = 20; }
  draw(ctx, time, effects) {
    if (this.collected) {
      const fx = effects.find(e => e.idx === this.idx);
      if (fx) { ctx.save(); ctx.globalAlpha = fx.life * 0.5; ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(this.x, this.y-10); ctx.lineTo(this.x+7, this.y); ctx.lineTo(this.x, this.y+10); ctx.lineTo(this.x-7, this.y); ctx.closePath(); ctx.fill(); ctx.restore(); }
      return;
    }
    const bobY = Math.sin(time*2.5 + this.idx*1.7)*5, cx = this.x, cy = this.y + bobY;
    ctx.save(); ctx.shadowColor = 'rgba(200,200,255,0.3)'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(cx, cy-10); ctx.lineTo(cx+7, cy); ctx.lineTo(cx, cy+10); ctx.lineTo(cx-7, cy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx, cy-5); ctx.lineTo(cx+3, cy); ctx.lineTo(cx, cy+3); ctx.lineTo(cx-3, cy); ctx.closePath(); ctx.fill();
    const pulse = 0.5 + Math.sin(time*3+this.idx)*0.3;
    ctx.fillStyle = `rgba(200,220,255,${pulse*0.15})`; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }
}

export class Platform {
  constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; }
  draw(ctx) {
    ctx.fillStyle = '#1a1a1e'; ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#2a2a30'; ctx.fillRect(this.x, this.y, this.w, 2);
    ctx.fillStyle = '#111115'; ctx.fillRect(this.x, this.y+this.h-2, this.w, 2);
    ctx.fillStyle = '#222228';
    for (let i=0; i<this.w; i+=18) for (let j=6; j<this.h; j+=10) if (Math.sin(i*0.7+j*1.3)>0.3) ctx.fillRect(this.x+i+2, this.y+j, 2, 2);
  }
}
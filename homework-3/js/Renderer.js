import { CONFIG } from './config.js';

export class Renderer {
  constructor(canvas) {
    canvas.width = CONFIG.WIDTH;
    canvas.height = CONFIG.HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.cachedBg = [null, null, null];
  }

  resize(scale) {
    const canvas = this.ctx.canvas;
    canvas.style.width = (CONFIG.WIDTH * scale) + 'px';
    canvas.style.height = (CONFIG.HEIGHT * scale) + 'px';
  }

  clear() {
    this.ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  }

  drawBackground(levelIdx) {
    const ctx = this.ctx;
    let tc, bc;
    if (levelIdx === 0) { tc = '#0a0c10'; bc = '#0f1118'; }
    else if (levelIdx === 1) { tc = '#12100d'; bc = '#0d0b09'; }
    else { tc = '#08080e'; bc = '#0c0c14'; }

    const g = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
    g.addColorStop(0, tc); g.addColorStop(1, bc);
    ctx.fillStyle = g; ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    this._drawAtmosphere();
  }

  _drawAtmosphere() {
    const ctx = this.ctx;
    const t = Date.now() / 1000;
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#8899aa';
    for (let i = 0; i < 3; i++) {
      const y = 150 + i*150 + Math.sin(t*0.3+i)*20;
      ctx.beginPath();
      ctx.ellipse(CONFIG.WIDTH/2 + Math.sin(t*0.2+i*2)*100, y, CONFIG.WIDTH*0.7, 60+i*20, 0, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.025;
    const rx = 200 + Math.sin(t*0.15)*100;
    const rg = ctx.createLinearGradient(rx, 0, rx+200, CONFIG.HEIGHT);
    rg.addColorStop(0, '#fff'); rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.moveTo(rx,0); ctx.lineTo(rx+300,CONFIG.HEIGHT); ctx.lineTo(rx+100,CONFIG.HEIGHT); ctx.lineTo(rx-50,0); ctx.fill();
    ctx.restore();
  }

  drawOverlay(alpha = 0.5) {
    this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    this.ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  }
}
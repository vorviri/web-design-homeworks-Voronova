import { CONFIG } from './config.js';

export class ParticleSystem {
  constructor() { this.particles = []; this.effects = []; this.dust = []; }
  initDust(count=40) {
    this.dust = [];
    for (let i=0; i<count; i++) this.dust.push({ x:Math.random()*CONFIG.WIDTH, y:Math.random()*CONFIG.HEIGHT, size:1+Math.random()*2, speed:0.2+Math.random()*0.5, alpha:0.05+Math.random()*0.15, drift:Math.random()*Math.PI*2 });
  }
  addSplash(x, y) {
    const colors = ['#ff4444','#44ff66','#4488ff','#ffcc33','#ff44cc','#44ffcc','#ff8833','#aa66ff'];
    for (let i=0; i<24; i++) { const a=Math.random()*Math.PI*2, sp=2+Math.random()*5; this.particles.push({ x,y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-2, life:1, decay:0.018, size:2+Math.random()*4, color:colors[Math.floor(Math.random()*colors.length)] }); }
    this.particles.push({ x,y, vx:0, vy:0, life:1, decay:0.06, size:35, color:'#fff', isFlash:true });
  }
  addTunnelFX(x, y) { for (let i=0; i<35; i++) { const a=(Math.PI*2/35)*i; this.particles.push({ x,y, vx:Math.cos(a)*2.5, vy:Math.sin(a)*2.5, life:1, decay:0.012, size:3+Math.random()*4, color:'#000' }); } }
  addHitEffect(x, y) { for (let i=0; i<10; i++) this.particles.push({ x,y, vx:(Math.random()-0.5)*4, vy:(Math.random()-0.5)*4, life:1, decay:0.03, size:3, color:'#ff4444' }); }
  update(dt) {
    for (let i=this.particles.length-1; i>=0; i--) { const p=this.particles[i]; p.x+=p.vx; p.y+=p.vy; if(!p.isFlash) p.vy+=0.12; p.life-=p.decay; if(p.life<=0) this.particles.splice(i,1); }
    for (let i=this.effects.length-1; i>=0; i--) { const e=this.effects[i]; e.life-=0.03; if(e.life<=0) this.effects.splice(i,1); }
    for (const d of this.dust) { d.x+=d.speed; d.y+=Math.sin(d.drift)*0.3; d.drift+=0.01; if(d.x>CONFIG.WIDTH+10) { d.x=-10; d.y=Math.random()*CONFIG.HEIGHT; } }
  }
  draw(ctx) {
    for (const p of this.particles) { ctx.globalAlpha=p.life; if(p.isFlash) { const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*p.life); g.addColorStop(0,'#fff'); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=g; } else { ctx.fillStyle=p.color; } ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha=1;
  }
  drawDust(ctx) { for (const d of this.dust) { ctx.fillStyle=`rgba(180,180,200,${d.alpha})`; ctx.beginPath(); ctx.arc(d.x,d.y,d.size,0,Math.PI*2); ctx.fill(); } }
  addEffect(idx) { this.effects.push({ idx, life:1 }); }
  reset() { this.particles=[]; this.effects=[]; }
}
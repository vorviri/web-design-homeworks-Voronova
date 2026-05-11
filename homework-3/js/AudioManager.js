export class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    
    ['jump','crystal','tunnel','hurt','win','click'].forEach(n => {
      this.sounds[n] = new Audio(`assets/sounds/${n}.mp3`);
      this.sounds[n].volume = 0.25;
      this.sounds[n].preload = 'auto';
    });

    this.music = new Audio('assets/sounds/music.mp3');
    this.music.volume = 0.15;
    this.music.loop = true;
    this.music.preload = 'auto';
  }

  play(name) {
    if (!this.enabled) return;
    const s = this.sounds[name];
    if (s) {
      s.currentTime = 0;
      s.play().catch(() => {});
      return;
    }
    if (this.ctx) this._proc(name);
  }

  _proc(name) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    const t = this.ctx.currentTime;

    if (name === 'jump') { o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(400, t + 0.15); }
    else if (name === 'crystal') { o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(1400, t + 0.12); }
    else if (name === 'hurt') { o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(80, t + 0.4); }
    else if (name === 'tunnel') { o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.5); }
    else if (name === 'win') { o.type = 'sine'; o.frequency.setValueAtTime(523, t); o.frequency.setValueAtTime(659, t + 0.2); o.frequency.setValueAtTime(784, t + 0.4); }
    else { o.frequency.setValueAtTime(440, t); }

    o.type = name === 'crystal' ? 'sine' : 'triangle';
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.start(t); o.stop(t + 0.35);
  }

  playMusic() {
    if (!this.music) return;
    this.music.play().catch(e => console.warn('🔇 Музыка заблокирована браузером:', e.message));
  }

  pauseMusic() {
    if (!this.music) return;
    this.music.pause();
  }

  stopMusic() {
    if (!this.music) return;
    this.music.pause();
    this.music.currentTime = 0;
  }
}
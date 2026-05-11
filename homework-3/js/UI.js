import { CONFIG } from './config.js';

export class UI {
  constructor() {
    this.game = null;
    this._cache = {};
  }

  init(game) {
    this.game = game;
    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this._cache = {
      overlay: document.getElementById('uiOverlay'),
      hud: document.getElementById('hud'),
      pauseBtn: document.getElementById('pauseBtn'),
      lives: document.getElementById('livesDisplay'),
      crystals: document.getElementById('crystalCount'),
      levelSelect: document.getElementById('levelSelect'),
      panels: {
        main: document.getElementById('mainMenu'),
        controls: document.getElementById('controlsPanel'),
        pause: document.getElementById('pausePanel'),
        lose: document.getElementById('losePanel'),
        story: document.getElementById('storyPanel'),
        stats: document.getElementById('statsPanel')
      }
    };
  }

  _bindEvents() {
  
    document.addEventListener('click', (e) => {
      if (e.target.closest('.menu-btn') || e.target.closest('#pauseBtn')) {
        this.game.audio.play('click');
      }
    });

    // Главное меню
    document.getElementById('btnStart').addEventListener('click', () => this._startGame());
    document.getElementById('btnControls').addEventListener('click', () => this._showPanel('controls'));
    document.getElementById('btnBackControls').addEventListener('click', () => this._showPanel('main'));
    document.getElementById('btnLevelSelect').addEventListener('click', () => this._toggleLevelSelect());

    // Кнопки выбора уровней
    document.querySelectorAll('#levelSelect .menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.level);
        this._loadAndStart(idx);
      });
    });

    // Старт уровня после истории
    document.getElementById('btnBegin').addEventListener('click', () => this._beginLevel());

    // Пауза
    this._cache.pauseBtn.addEventListener('click', () => {
      if (this.game.state === 'playing') {
        this.game.setState('paused');
        this.game.audio.pauseMusic();
        this._showPanel('pause');
      }
    });

    // Навигация по панелям
    document.getElementById('btnResume').addEventListener('click', () => this._resume());
    document.getElementById('btnRestart').addEventListener('click', () => this._restart());
    document.getElementById('btnMenu').addEventListener('click', () => this.goToMenu());
    document.getElementById('btnRetry').addEventListener('click', () => this._restart());
    document.getElementById('btnMenuLose').addEventListener('click', () => this.goToMenu());
    document.getElementById('btnNext').addEventListener('click', () => this.game.nextLevel());
    document.getElementById('btnRetryStats').addEventListener('click', () => this._restart());

    // Горячие клавиши
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Escape' || e.code === 'KeyP') && this.game.state === 'playing') {
        this.game.setState('paused');
        this.game.audio.pauseMusic();
        this._showPanel('pause');
      }
    });
  }

  _showPanel(name) {
    Object.values(this._cache.panels).forEach(p => p.style.display = 'none');
    if (this._cache.panels[name]) {
      this._cache.panels[name].style.display = 'block';
      this._cache.overlay.classList.add('active');
    }
  }

  _hideAll() {
    Object.values(this._cache.panels).forEach(p => p.style.display = 'none');
    this._cache.levelSelect.style.display = 'none';
    this._cache.overlay.classList.remove('active');
  }

  _startGame() {
    this._loadAndStart(0);
  }

  _loadAndStart(idx) {
    this.game.loadLevel(idx);
    this.game.setState('story');
    this.showStory(this.game.level.story);
  }

  showStory(story) {
    document.getElementById('storyTitle').textContent = story.title;
    document.getElementById('storyContent').textContent = story.text;
    this._showPanel('story');
  }

  _beginLevel() {
    this.game.audio.playMusic();
    this._hideAll();
    this.game.setState('playing');
    this._cache.hud.style.display = 'flex';
    this._cache.pauseBtn.style.display = 'block';
  }

  _resume() {
    this.game.audio.playMusic();
    this._hideAll();
    this.game.setState('playing');
    this._cache.hud.style.display = 'flex';
    this._cache.pauseBtn.style.display = 'block';
  }

  _restart() {
    this.game.audio.playMusic();
    this._hideAll();
    this.game.loadLevel(this.game.currentLevel);
    this.game.setState('playing');
    this._cache.hud.style.display = 'flex';
    this._cache.pauseBtn.style.display = 'block';
  }

  goToMenu() {
    this.game.audio.stopMusic();
    this.game.level = null;
    this.game.setState('menu');
    this.game.particles.reset();
    this._cache.hud.style.display = 'none';
    this._cache.pauseBtn.style.display = 'none';
    this._hideAll();
    this._showPanel('main');
  }

  _toggleLevelSelect() {
    const ls = this._cache.levelSelect;
    ls.style.display = ls.style.display === 'none' ? 'block' : 'none';
  }

  updateHUD(lives, collected, total) {
    let hearts = '';
    for (let i = 0; i < CONFIG.MAX_LIVES; i++) {
      hearts += i < lives ? '<span class="heart">♥</span>' : '<span class="heart empty">♥</span>';
    }
    this._cache.lives.innerHTML = hearts;
    this._cache.crystals.textContent = `◆ ${collected} / ${total}`;
  }

  showStats(score, collected, total, levelIdx) {
    this.game.setState('stats');
    this._cache.hud.style.display = 'none';
    this._cache.pauseBtn.style.display = 'none';

    const ratio = total > 0 ? collected / total : 0;
    document.getElementById('statsScore').textContent = `Очки: ${score}`;
    document.getElementById('statsCrystalCount').textContent = `${collected} / ${total}`;

    const icons = document.querySelectorAll('#statsCrystals .crystal-icon');
    icons[0].classList.toggle('lit', ratio > 0);
    icons[1].classList.toggle('lit', ratio > 0.33);
    icons[2].classList.toggle('lit', ratio > 0.66);

    const nextBtn = document.getElementById('btnNext');
    nextBtn.textContent = levelIdx < 2 ? 'Следующий уровень' : 'В меню';

    this._showPanel('stats');
    this.game.audio.play('win');
  }

  showLose() {
    this.game.setState('lose');
    this._cache.hud.style.display = 'none';
    this._cache.pauseBtn.style.display = 'none';
    this._showPanel('lose');
  }
}
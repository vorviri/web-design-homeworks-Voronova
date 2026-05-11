import { CONFIG } from './config.js';
import { InputHandler } from './InputHandler.js';
import { AudioManager } from './AudioManager.js';
import { Renderer } from './Renderer.js';
import { UI } from './UI.js';
import { Game } from './Game.js';

function init() {
  const canvas = document.getElementById('gameCanvas');
  
  canvas.width = CONFIG.WIDTH;
  canvas.height = CONFIG.HEIGHT;

  const input = new InputHandler();
  const audio = new AudioManager();
  const renderer = new Renderer(canvas); // здесь тоже задаются размеры
  const ui = new UI();
  const game = new Game(canvas, input, audio, renderer, ui);

  function resize() {
    const s = Math.min(window.innerWidth / CONFIG.WIDTH, window.innerHeight / CONFIG.HEIGHT);
    renderer.resize(s);
  }
  window.addEventListener('resize', resize);
  resize();

  game.start();
}

init();
export class InputHandler {
  constructor() {
    this.keys = {};
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  isDown(...codes) {
    return codes.some(code => this.keys[code]);
  }

  reset() {
    this.keys = {};
  }
}
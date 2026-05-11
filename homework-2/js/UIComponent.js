export class UIComponent {
  #id; #title; #type; #element; #minimized = false; #handlers = [];

  constructor(config) {
    this.#id = config.id || `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.#title = config.title || 'Widget';
    this.#type = config.type || 'default';
  }

  get id() { return this.#id; }
  get title() { return this.#title; }
  get type() { return this.#type; }
  get element() { return this.#element; }

  #createWrapper() {
    const el = document.createElement('div');
    el.className = `widget widget--${this.#type}`;
    el.dataset.id = this.#id;
    el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">${this.#title}</span>
        <div class="widget-actions">
          <button class="widget-btn btn-min" title="Свернуть">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="widget-btn btn-close" title="Удалить">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="widget-body"></div>
    `;
    this.#element = el;
  }

  #bindEvents() {
    const header = this.#element.querySelector('.widget-header');
    const handler = (e) => {
      if (e.target.closest('.btn-min')) this.toggleMin();
      if (e.target.closest('.btn-close')) this.destroy();
    };
    header.addEventListener('click', handler);
    this.#handlers.push({ el: header, type: 'click', fn: handler });
  }

  buildContent() { throw new Error('buildContent() must be implemented'); }

  render() {
    this.#createWrapper();
    this.#bindEvents();
    this.#element.querySelector('.widget-body').appendChild(this.buildContent());
    return this.#element;
  }

  toggleMin() {
    this.#minimized = !this.#minimized;
    this.#element.classList.toggle('minimized', this.#minimized);
  }

  destroy() {
    this.#handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this.#handlers = [];
    if (this.#element?.parentNode) this.#element.parentNode.removeChild(this.#element);
    if (typeof this.onRemove === 'function') this.onRemove();
  }
}
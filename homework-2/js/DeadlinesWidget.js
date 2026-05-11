import { UIComponent } from './UIComponent.js';

export class DeadlinesWidget extends UIComponent {
  #deadlines = [];
  #boundAdd = null;
  #boundRemove = null;

  constructor() {
    super({ title: '⏱ Дедлайны', type: 'deadlines' });
    this.#boundAdd = this.#handleAdd.bind(this);
    this.#boundRemove = this.#handleRemove.bind(this);
  }

 buildContent() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="deadlines-list" id="dl"></div>
    <div class="deadlines-stats">
      <div class="stat-item"><span class="stat-value" id="st">0</span><span class="stat-label">Всего</span></div>
      <div class="stat-item"><span class="stat-value" id="sd">0</span><span class="stat-label">Выполнено</span></div>
    </div>
  `;

  const listEl = wrap.querySelector('#dl');

  document.addEventListener('furni:deadline-added', this.#boundAdd);
  document.addEventListener('furni:deadline-removed', this.#boundRemove);

  // 🔥 НОВАЯ ЧАСТЬ: синхронизация с существующими задачами
  const existingTasks = JSON.parse(localStorage.getItem('furni-todo') || '[]');
  for (const task of existingTasks) {
    if (task.date && !this.#deadlines.find(d => d.id === task.id)) {
      this.#deadlines.push({ 
        id: task.id, 
        title: task.text, 
        date: task.date, 
        status: task.done ? 'done' : 'pending' 
      });
    }
  }
  this.#deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (listEl) { this.#render(listEl); this.#updateStats(wrap); }


  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.deadline-check');
    if (btn) {
      const idx = +btn.dataset.id;
      if (this.#deadlines[idx]) {
        this.#deadlines[idx].status = this.#deadlines[idx].status === 'done' ? 'pending' : 'done';
        this.#render(listEl);
        this.#updateStats(wrap);
      }
    }
  });

  return wrap;
}

  #handleAdd(e) {
    const { id, title, date } = e.detail;
    if (!this.#deadlines.find(d => d.id === id)) {
      this.#deadlines.push({ id, title, date, status: 'pending' });
      this.#deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
      const wrap = this.element;
      const listEl = wrap?.querySelector('#dl');
      if (listEl) { this.#render(listEl); this.#updateStats(wrap); }
    }
  }

  #handleRemove(e) {
    const { id } = e.detail;
    const lenBefore = this.#deadlines.length;
    this.#deadlines = this.#deadlines.filter(d => d.id !== id);
    if (this.#deadlines.length !== lenBefore) {
      const wrap = this.element;
      const listEl = wrap?.querySelector('#dl');
      if (listEl) { this.#render(listEl); this.#updateStats(wrap); }
    }
  }

  #render(listEl) {
    if (!listEl) return;
    listEl.innerHTML = this.#deadlines.map((d, idx) => {
      const cls = d.status === 'done' ? 'done' : '';
      return `
        <div class="deadline-item ${cls}">
          <button class="deadline-check" data-id="${idx}">${d.status === 'done' ? '✓' : ''}</button>
          <div class="deadline-content">
            <div class="deadline-title">${this.#esc(d.title)}</div>
            <div class="deadline-days">${this.#formatDate(d.date)}</div>
          </div>
        </div>`;
    }).join('');
  }

  #updateStats(wrap) {

    const totalEl = wrap?.querySelector('#st');
    const doneEl = wrap?.querySelector('#sd');
    if (totalEl) totalEl.textContent = this.#deadlines.length;
    if (doneEl) doneEl.textContent = this.#deadlines.filter(d => d.status === 'done').length;
  }

  #formatDate(iso) { const [y,m,d] = iso.split('-'); return `${d}.${m}.${y}`; }
  #esc(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  destroy() {
    document.removeEventListener('furni:deadline-added', this.#boundAdd);
    document.removeEventListener('furni:deadline-removed', this.#boundRemove);
    super.destroy();
  }
}
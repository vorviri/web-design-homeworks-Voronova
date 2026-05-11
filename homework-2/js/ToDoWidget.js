import { UIComponent } from './UIComponent.js';

export class ToDoWidget extends UIComponent {
  #tasks = [];

  constructor() {
    super({ title: '📋 Задачи', type: 'todo' });
    this.#tasks = JSON.parse(localStorage.getItem('furni-todo') || '[]');
  }

  buildContent() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <form class="todo-form">
        <input type="text" class="todo-input" placeholder="Название задачи..." required />
        <input type="date" class="todo-input" id="task-date" />
        <button type="submit" class="btn-add">Сохранить</button>
      </form>
      <ul class="todo-list"></ul>
    `;

    const form = wrap.querySelector('.todo-form');
    const textInput = wrap.querySelector('input[type="text"]');
    const dateInput = wrap.querySelector('#task-date');
    const list = wrap.querySelector('.todo-list');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textInput.value.trim();
      const date = dateInput.value;
      if (!text) return;

      const newTask = { id: Date.now().toString(), text, date: date || null, done: false };
      this.#addTask(newTask);
      textInput.value = '';
      dateInput.value = '';
    });

    list.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.todo-del');
      if (delBtn) this.#removeTask(delBtn.dataset.id);
    });

    this.#renderList(list);
    return wrap;
  }

  #addTask(task) {
    this.#tasks.unshift(task);
    this.#save();
    this.#renderList(this.element.querySelector('.todo-list'));

    if (task.date) {
      document.dispatchEvent(new CustomEvent('furni:deadline-added', {
        detail: { id: task.id, title: task.text, date: task.date }
      }));
    }
  }

  #removeTask(id) {
    this.#tasks = this.#tasks.filter(t => t.id !== id);
    this.#save();
    this.#renderList(this.element.querySelector('.todo-list'));
    document.dispatchEvent(new CustomEvent('furni:deadline-removed', { detail: { id } }));
  }

  #save() { localStorage.setItem('furni-todo', JSON.stringify(this.#tasks)); }

  #renderList(listEl) {
    listEl.innerHTML = this.#tasks.map(t => `
      <li class="todo-item">
        <span class="todo-text">${this.#esc(t.text)}</span>
        ${t.date ? `<span class="todo-date">${this.#formatDate(t.date)}</span>` : ''}
        <button class="todo-del" data-id="${t.id}" title="Удалить">✕</button>
      </li>
    `).join('');
  }

  #formatDate(iso) { const [y,m,d] = iso.split('-'); return `${d}.${m}`; }
  #esc(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}
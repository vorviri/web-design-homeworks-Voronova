import { ToDoWidget } from './ToDoWidget.js';
import { QuoteWidget } from './QuoteWidget.js';
import { DeadlinesWidget } from './DeadlinesWidget.js';
import { CurrencyWidget } from './CurrencyWidget.js';
import { PaletteWidget } from './PaletteWidget.js'; 

export class Dashboard {
  #widgets = []; #grid; #empty;

  constructor(gridSel, emptySel) {
    this.#grid = document.querySelector(gridSel);
    this.#empty = document.querySelector(emptySel);
  }

  #factories = {
    todo: () => new ToDoWidget(),
    quote: () => new QuoteWidget(),
    deadlines: () => new DeadlinesWidget(),
    currency: () => new CurrencyWidget(),
    palette: () => new PaletteWidget() 
  };

  addWidget(type) {
    const factory = this.#factories[type];
    if (!factory) return console.warn(`Unknown: ${type}`);
    const w = factory();
    w.onRemove = () => { this.#widgets = this.#widgets.filter(x => x.id !== w.id); this.#toggleEmpty(); };
    this.#grid.appendChild(w.render());
    this.#widgets.push(w);
    this.#toggleEmpty();
  }

  removeWidget(id) {
    const w = this.#widgets.find(x => x.id === id);
    if (w) w.destroy();
  }

  #toggleEmpty() { this.#empty.style.display = this.#widgets.length === 0 ? 'block' : 'none'; }
}
import { UIComponent } from './UIComponent.js';

export class PaletteWidget extends UIComponent {
  #colors = [
    { name: 'Основной', hex: '#2C3E50', type: 'Корпус' },
    { name: 'Акцент', hex: '#E67E22', type: 'Фасады' },
    { name: 'Фон', hex: '#ECF0F1', type: 'Стены' },
    { name: 'Дерево', hex: '#8B6F47', type: 'Столешница' },
    { name: 'Металл', hex: '#95A5A6', type: 'Ручки' },
    { name: 'Текстиль', hex: '#34495E', type: 'Обивка' }
  ];

  constructor() { super({ title: '🎨 Палитра', type: 'palette' }); }

  buildContent() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="palette-grid" id="pg"></div><button class="btn-refresh" id="pr"> Случайная палитра</button>`;
    const grid = wrap.querySelector('#pg');
    const btn = wrap.querySelector('#pr');

    const render = () => {
      grid.innerHTML = this.#colors.map(c => `
        <div class="palette-item" onclick="navigator.clipboard.writeText('${c.hex}')">
          <div class="palette-swatch" style="background:${c.hex}"></div>
          <div class="palette-info">
            <div class="palette-name">${c.name}</div>
            <div class="palette-type">${c.type}</div>
            <div class="palette-hex">${c.hex}</div>
          </div>
          <div class="palette-copy">📋</div>
        </div>
      `).join('');
    };

    const palettes = [
      [{name:'Основной',hex:'#2C3E50',type:'Корпус'},{name:'Акцент',hex:'#E67E22',type:'Фасады'},{name:'Фон',hex:'#ECF0F1',type:'Стены'},{name:'Дерево',hex:'#8B6F47',type:'Столешница'},{name:'Металл',hex:'#95A5A6',type:'Ручки'},{name:'Текстиль',hex:'#34495E',type:'Обивка'}],
      [{name:'Основной',hex:'#1A1A2E',type:'Корпус'},{name:'Акцент',hex:'#E94560',type:'Фасады'},{name:'Фон',hex:'#F5F5F5',type:'Стены'},{name:'Дерево',hex:'#C9A87C',type:'Столешница'},{name:'Металл',hex:'#D4AF37',type:'Ручки'},{name:'Текстиль',hex:'#16213E',type:'Обивка'}],
      [{name:'Основной',hex:'#2D3436',type:'Корпус'},{name:'Акцент',hex:'#00B894',type:'Фасады'},{name:'Фон',hex:'#DFE6E9',type:'Стены'},{name:'Дерево',hex:'#A89F91',type:'Столешница'},{name:'Металл',hex:'#636E72',type:'Ручки'},{name:'Текстиль',hex:'#74B9FF',type:'Обивка'}]
    ];

    btn.addEventListener('click', () => { this.#colors = palettes[Math.floor(Math.random()*palettes.length)]; render(); });
    render();
    return wrap;
  }
}
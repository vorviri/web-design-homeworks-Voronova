import { UIComponent } from './UIComponent.js';

export class CurrencyWidget extends UIComponent {
  constructor() {
    super({ title: '💱 Курс импорта', type: 'currency' });
  }

  buildContent() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="currency-list" id="currency-list">
        <div class="loading-spinner"></div>
      </div>
      <button class="btn-refresh" id="cur-refresh">🔄 Обновить курс</button>
    `;

    const listEl = wrap.querySelector('#currency-list');
    const btn = wrap.querySelector('#cur-refresh');

    const loadRates = async () => {
      listEl.innerHTML = '<div class="loading-spinner"></div>';
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        const usdToRub = data.rates.RUB.toFixed(2);
        const eurToRub = (data.rates.RUB / data.rates.EUR).toFixed(2); // Кросс-курс

        listEl.innerHTML = `
          <div class="currency-item">
            <div class="cur-left">
              <span class="cur-flag">🇺</span>
              <div>
                <div class="cur-name">USD / RUB</div>
                <div class="cur-desc">Фурнитура / Механизмы</div>
              </div>
            </div>
            <div class="cur-right">
              <div class="cur-val">${usdToRub} ₽</div>
            </div>
          </div>
          <div class="currency-item">
            <div class="cur-left">
              <span class="cur-flag">🇪🇺</span>
              <div>
                <div class="cur-name">EUR / RUB</div>
                <div class="cur-desc">Итальянские фасады</div>
              </div>
            </div>
            <div class="cur-right">
              <div class="cur-val">${eurToRub} ₽</div>
            </div>
          </div>
        `;
      } catch (err) {
        listEl.innerHTML = '<div style="color:var(--red); text-align:center;">Ошибка сети</div>';
      }
    };

    btn.addEventListener('click', loadRates);
    loadRates(); 
    return wrap;
  }
}
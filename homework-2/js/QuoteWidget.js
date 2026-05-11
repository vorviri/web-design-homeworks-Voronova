import { UIComponent } from './UIComponent.js';

export class QuoteWidget extends UIComponent {
  #lastQuote = '';

  constructor() { super({ title: '💡 Цитата дня', type: 'quote' }); }

  buildContent() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="quote-content">
        <p class="quote-text">Загрузка...</p>
        <p class="quote-author"></p>
      </div>
      <button class="btn-refresh">🔄 Новая цитата</button>
    `;

    const textEl = wrap.querySelector('.quote-text');
    const authorEl = wrap.querySelector('.quote-author');
    const btn = wrap.querySelector('.btn-refresh');

    const fallbackQuotes = [
      { text: "Дизайн — это не только то, как вещь выглядит, но и то, как она работает.", author: "Стив Джобс" },
      { text: "Простота — это высшая степень утончённости.", author: "Леонардо да Винчи" },
      { text: "Всё гениальное просто.", author: "Народная мудрость" },
      { text: "Успех — это не конец, неудача — не поражение. Важна лишь мужество продолжать.", author: "Уинстон Черчилль" },
      { text: "Лучший способ предсказать будущее — создать его.", author: "Питер Друкер" }
    ];

    const fetchWithTimeout = (url, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        fetch(url, { signal: controller.signal })
          .then(res => { clearTimeout(timer); resolve(res); })
          .catch(err => { clearTimeout(timer); reject(err); });
      });
    };

    const show = async () => {
      textEl.textContent = 'Загрузка...';
      authorEl.textContent = '';
      btn.disabled = true;

      try {

        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = encodeURIComponent('https://api.forismatic.com/api/1.0/?method=getQuote&lang=ru&format=json');
        
        const res = await fetchWithTimeout(proxyUrl + targetUrl);
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        const quote = (data.quoteText || '').trim();
        const author = data.quoteAuthor && data.quoteAuthor !== 'unknown' ? data.quoteAuthor : 'Неизвестный автор';

        if (quote === this.#lastQuote || !quote) {
          throw new Error('Repeat or empty');
        }
        
        this.#lastQuote = quote;
        textEl.textContent = `«${quote}»`;
        authorEl.textContent = `— ${author}`;
      } catch (err) {

        const available = fallbackQuotes.filter(q => q.text !== this.#lastQuote);
        const q = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : fallbackQuotes[0];
        
        this.#lastQuote = q.text;
        textEl.textContent = `«${q.text}»`;
        authorEl.textContent = `— ${q.author}`;
      } finally {
        btn.disabled = false;
      }
    };

    btn.addEventListener('click', show);
    show();
    return wrap;
  }
}
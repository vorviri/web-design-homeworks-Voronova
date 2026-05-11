document.addEventListener('DOMContentLoaded', () => {
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Progress bar
  const bar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    const s = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? `${(s / h) * 100}%` : '0%';
  });

  // Reveal animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.work__item, .about__text, .detail').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // Dark mode on double click
  let clicks = 0;
  document.addEventListener('dblclick', () => {
    clicks++;
    if (clicks === 2) {
      const root = document.documentElement;
      const isDark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', isDark ? 'light' : 'dark');
      clicks = 0;
    }
    setTimeout(() => clicks = 0, 500);
  });
});
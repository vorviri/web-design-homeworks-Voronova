document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Автоматическая подстановка текущего года в футер
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 2. Прогресс-бар прокрутки страницы
  const progressBar = document.getElementById('progressBar');
  
  const updateProgressBar = () => {
    // window.scrollY более надежен в современных браузерах, чем documentElement.scrollTop
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateProgressBar, { passive: true });

  // 3. Анимация появления элементов при скролле (Intersection Observer)
  const observerOptions = {
    threshold: 0.1, 
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); 
      }
      });
  }, observerOptions);


  const revealElements = document.querySelectorAll('.work__item, .about__text, .detail');
  revealElements.forEach(el => {
    el.classList.add('reveal'); 
    observer.observe(el);
  });

  // 4. Переключение тёмной темы по двойному клику (ИСПРАВЛЕННАЯ ВЕРСИЯ)
  document.addEventListener('dblclick', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  });

});

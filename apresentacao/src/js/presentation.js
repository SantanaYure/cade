/* ============================================
   presentation.js — Navegação entre slides
   ============================================ */

(function () {
  const slides = document.querySelectorAll('.slide');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const counter = document.getElementById('counter');
  const dotsContainer = document.getElementById('dots');
  const total = slides.length;
  let current = 0;

  function buildDots() {
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' dot--active' : '');
      dot.setAttribute('aria-hidden', 'true');
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(index) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('dot--active', i === index);
    });
  }

  function goTo(index) {
    slides[current].classList.remove('slide--active');
    current = index;
    slides[current].classList.add('slide--active');

    counter.textContent = `Slide ${current + 1} de ${total}`;
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;
    updateDots(current);
  }

  btnPrev.addEventListener('click', function () {
    if (current > 0) goTo(current - 1);
  });

  btnNext.addEventListener('click', function () {
    if (current < total - 1) goTo(current + 1);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' && current < total - 1) goTo(current + 1);
    if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1);
  });

  buildDots();
  goTo(0);
})();

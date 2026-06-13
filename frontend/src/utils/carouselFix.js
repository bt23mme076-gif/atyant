// Fix for stuck carousels on mobile
export const initCarouselFix = () => {
  // Prevent scroll issues
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.swiper-container')) {
      e.stopPropagation();
    }
  }, { passive: true });

  // Fix iOS bounce
  document.body.addEventListener('touchstart', (e) => {
    if (e.target.closest('.swiper-container')) {
      e.stopPropagation();
    }
  }, { passive: true });

  // Reinitialize on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (window.Swiper) {
        window.Swiper.update();
      }
    }, 200);
  });

  // Fix viewport height on mobile
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
};
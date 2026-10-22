// Small enhancements. The site works without them.
(() => {
  const io = 'IntersectionObserver' in window;

  // Home: highlight the header link for the section in view
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')].filter(a => a.hash.length > 1);
  const sections = new Map(navLinks.map(a => [document.querySelector(a.hash), a]).filter(([el]) => el));
  if (io && sections.size) {
    const visible = new Set();
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      let current = null;
      for (const el of sections.keys()) if (visible.has(el)) { current = el; break; }
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      if (current) sections.get(current).setAttribute('aria-current', 'true');
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((a, el) => spy.observe(el));
  }

  // Cars: highlight the car in view in the side timeline
  const carLinks = [...document.querySelectorAll('.garage-nav a')];
  const carList = document.querySelector('.garage-nav ol');
  if (io && carLinks.length) {
    const cars = new Map(carLinks.map(a => [document.querySelector(a.hash), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        carLinks.forEach(l => l.classList.remove('on'));
        const a = cars.get(e.target);
        a.classList.add('on');
        if (carList.scrollWidth > carList.clientWidth) carList.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    cars.forEach((a, el) => el && spy.observe(el));
  }

  // Shared pop-up for photos and video
  const box = document.querySelector('.lightbox');
  if (!box || !box.showModal) return;
  const stage = box.querySelector('.stage');
  const cap = box.querySelector('p');
  const open = (node, caption) => { stage.replaceChildren(node); cap.textContent = caption || ''; box.showModal(); };
  box.addEventListener('close', () => stage.replaceChildren());
  box.addEventListener('click', e => { if (e.target === box || e.target.closest('button')) box.close(); });

  // Cars: click a photo to see it larger
  document.querySelectorAll('.car .pics img').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    const show = () => { const big = new Image(); big.src = img.src; big.alt = img.alt; open(big, img.alt); };
    img.addEventListener('click', show);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
  });

  // Home: play a YouTube video in the pop-up
  document.querySelectorAll('a[data-yt]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + a.dataset.yt + '?autoplay=1&rel=0';
      f.title = a.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.className = 'video';
      open(f, a.dataset.caption);
    });
  });
})();

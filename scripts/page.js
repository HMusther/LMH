
const setupSmoothScroll = () => {
  const handleAnchorClick = (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    const resolved = new URL(href, window.location.href);
    const isSamePage = resolved.pathname === window.location.pathname;


    if (isSamePage && !resolved.hash) {
      event.preventDefault();
      history.replaceState(null, '', resolved.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!href.includes('#')) return;


    const hash = resolved.hash;
    if (!isSamePage || !hash) return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const targetPosition = target.offsetTop - navbarHeight;
    history.replaceState(null, '', hash);
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  };

  document.addEventListener('click', handleAnchorClick, { passive: false });


  const highlightActiveNav = () => {
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    const currentHash = window.location.hash;
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
      try {
        const u = new URL(link.href, window.location.href);
        const linkPath = u.pathname.replace(/\/index\.html$/, '/');
        const linkHash = u.hash;
        const samePage = linkPath === currentPath;
        const bothNoHash = !linkHash && !currentHash;
        const bothHash = linkHash && currentHash && linkHash === currentHash;
        const isActive = (samePage && (bothNoHash || bothHash)) || (!samePage && linkPath === currentPath);
        if (isActive) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      } catch (_) {}
    });
  };

  window.addEventListener('hashchange', highlightActiveNav, { passive: true });
  window.addEventListener('popstate', highlightActiveNav, { passive: true });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(highlightActiveNav, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(highlightActiveNav, 0));
  }


  const scrollToHashOnLoad = () => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const top = target.offsetTop - navbarHeight;
    window.scrollTo({ top, behavior: 'instant' in window ? 'instant' : 'auto' });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(scrollToHashOnLoad, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(scrollToHashOnLoad, 0));
  }
};

setupSmoothScroll();


const setupExternalLinksTargeting = () => {
  const anchors = document.querySelectorAll('a[href]');
  anchors.forEach((anchor) => {
    const hrefRaw = anchor.getAttribute('href');
    if (!hrefRaw) return;
    const href = hrefRaw.trim();

    const lower = href.toLowerCase();
    if (
      href.startsWith('#') ||
      lower.startsWith('mailto:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('javascript:')
    ) {
      return;
    }

    let resolvedUrl;
    try {
      resolvedUrl = new URL(href, window.location.href);
    } catch (_) {
      return;
    }

    const isExternal = resolvedUrl.origin !== window.location.origin;
    if (!isExternal) return;


    anchor.setAttribute('target', '_blank');
    const existingRel = (anchor.getAttribute('rel') || '').split(/\s+/);
    if (!existingRel.includes('noopener')) existingRel.push('noopener');
    if (!existingRel.includes('noreferrer')) existingRel.push('noreferrer');
    anchor.setAttribute('rel', existingRel.filter(Boolean).join(' ').trim());
  });
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(setupExternalLinksTargeting, 0);
} else {
  window.addEventListener('DOMContentLoaded', () => setTimeout(setupExternalLinksTargeting, 0));
}

  const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
          }
      });
  }, observerOptions);


  document.querySelectorAll('.fade-in').forEach(el => {

      if (el.id === 'gallery' && window.innerWidth <= 768) {
          el.classList.add('is-visible');
          return;
      }
      el.classList.add('reveal');
      observer.observe(el);
  });


  document.querySelectorAll('.reveal, .stagger').forEach(el => observer.observe(el));

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      const subject = `L.M.Hill Inquiry from ${name}`;
      const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0AMessage: ${message}`;
      
      window.location.href = `mailto:lmhillcarpets@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    });
  }




  const myModal = document.getElementById('myModal');
  const myInput = document.getElementById('myInput');
  if (myModal && myInput) {
    myModal.addEventListener('shown.bs.modal', () => {
      myInput.focus();
    });
  }


  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const handleNavbarShrink = () => {
      if (mobileQuery.matches) {
        navbar.classList.add('navbar-shrink');
        return;
      }
      if (window.scrollY > 20) {
        navbar.classList.add('navbar-shrink');
      } else {
        navbar.classList.remove('navbar-shrink');
      }
    };

    handleNavbarShrink();
    window.addEventListener('scroll', handleNavbarShrink, { passive: true });

    window.addEventListener('resize', handleNavbarShrink, { passive: true });
    mobileQuery.addEventListener('change', handleNavbarShrink);
  }


  const carouselEl = document.querySelector('#carouselExampleIndicators');
  if (carouselEl) {
    const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
    let startX = 0;
    let startY = 0;
    let isTouch = false;

    const threshold = 40;

    const onTouchStart = (e) => {
      isTouch = true;
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
    };

    const onTouchMove = (e) => {

      if (!isTouch) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      const t = (e.changedTouches && e.changedTouches[0]) || e;
      const dx = t.clientX - startX;
      if (Math.abs(dx) > threshold) {
        if (dx < 0) { bsCarousel.next(); } else { bsCarousel.prev(); }
      }
      isTouch = false;
    };


    carouselEl.addEventListener('touchstart', onTouchStart, { passive: true });
    carouselEl.addEventListener('touchmove', onTouchMove, { passive: false });
    carouselEl.addEventListener('touchend', onTouchEnd, { passive: true });


    let isMouseDown = false;
    carouselEl.addEventListener('mousedown', (e) => { isMouseDown = true; onTouchStart(e); });
    carouselEl.addEventListener('mousemove', (e) => { if (isMouseDown) onTouchMove(e); });
    document.addEventListener('mouseup', (e) => { if (isMouseDown) { onTouchEnd(e); isMouseDown = false; } });


    const pauseTargets = carouselEl.querySelectorAll('.carousel-caption .btn, .hero-caption .btn');
    pauseTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => bsCarousel.pause());
      el.addEventListener('mouseleave', () => bsCarousel.cycle());
      el.addEventListener('focus', () => bsCarousel.pause());
      el.addEventListener('blur', () => bsCarousel.cycle());
      el.addEventListener('touchstart', () => bsCarousel.pause(), { passive: true });
      el.addEventListener('touchend', () => bsCarousel.cycle(), { passive: true });
    });
  }


  const gallery = document.querySelector('.gallery-grid');
  if (gallery) {
    let overlay = document.querySelector('.lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML = '<img alt="Expanded gallery image" />';
      document.body.appendChild(overlay);
    }
    const overlayImg = overlay.querySelector('img');

    gallery.addEventListener('click', (e) => {
      const link = e.target.closest('a.gallery-item');
      if (!link) return;
      e.preventDefault();
      const src = link.getAttribute('href');
      overlayImg.src = src;
      overlay.classList.add('is-open');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === overlayImg) {
        overlay.classList.remove('is-open');
        overlayImg.removeAttribute('src');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('is-open');
    });
  }
/* Fancy 3D scroll & hover effects */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* ===== Cursor spotlight (mouse-tracked CSS variables) ===== */
  function initCursorTracking() {
    let raf = null;
    document.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        document.body.style.setProperty('--mouse-x', e.clientX + 'px');
        document.body.style.setProperty('--mouse-y', e.clientY + 'px');
        raf = null;
      });
    }, { passive: true });
  }

  function init() {
    initCursorTracking();

    /* ===== Background video playback speed ===== */
    const bgVideo = document.querySelector('.site-bg-video video');
    if (bgVideo) {
      bgVideo.playbackRate = 0.5;
    }
    /* ===== 3D scroll-triggered reveal ===== */
    const revealSelectors = [
      '.pub-item',
      '.talk-embed',
      '.research-tags',
      '.post article > div > h2',
      '.post article h2',
      '.post p',
      '.publications ol.bibliography > li'
    ];
    const revealEls = document.querySelectorAll(revealSelectors.join(','));
    revealEls.forEach((el, i) => {
      el.classList.add('fancy-reveal');
      el.style.transitionDelay = Math.min(i * 40, 240) + 'ms';
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fancy-revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('fancy-revealed'));
    }

    /* ===== Mouse-tracked 3D tilt on cards ===== */
    const tiltEls = document.querySelectorAll('.pub-item, .publications ol.bibliography > li');
    tiltEls.forEach((el) => {
      let rect = null;
      let raf = null;

      const onMove = (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotY = ((x - cx) / cx) * 4;
        const rotX = ((cy - y) / cy) * 4;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform =
            'perspective(1100px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translate3d(0, -4px, 0)';
        });
      };

      const onEnter = () => {
        rect = el.getBoundingClientRect();
        el.style.transition = 'transform 0.15s ease-out, box-shadow 0.25s ease, border-color 0.25s ease';
      };

      const onLeave = () => {
        rect = null;
        if (raf) cancelAnimationFrame(raf);
        el.style.transition = '';
        el.style.transform = '';
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });

    /* ===== Parallax 3D profile image ===== */
    const profileImg = document.querySelector('.profile img');
    if (profileImg) {
      const baseTransform = 'perspective(1200px)';
      let ticking = false;
      let hovering = false;

      profileImg.addEventListener('mouseenter', () => { hovering = true; });
      profileImg.addEventListener('mouseleave', () => {
        hovering = false;
        profileImg.style.transform = '';
      });

      profileImg.addEventListener('mousemove', (e) => {
        if (!hovering) return;
        const rect = profileImg.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        profileImg.style.transform =
          baseTransform + ' rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg) translateZ(8px)';
      });

      const onScroll = () => {
        if (hovering || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const tilt = Math.min(y * 0.04, 8);
          profileImg.style.transform =
            baseTransform + ' rotateX(' + (-tilt * 0.4).toFixed(2) + 'deg) rotateY(' + (tilt * 0.6).toFixed(2) + 'deg) translateY(' + (y * 0.04).toFixed(1) + 'px)';
          ticking = false;
        });
      };
      document.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ===== 3D parallax for the name heading ===== */
    const titleEl = document.querySelector('.post-title');
    if (titleEl) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const tilt = Math.min(y * 0.05, 10);
          titleEl.style.transform =
            'perspective(1000px) rotateX(' + (-tilt * 0.5).toFixed(2) + 'deg) translateY(' + (y * 0.08).toFixed(1) + 'px)';
          titleEl.style.opacity = Math.max(0.2, 1 - y / 600).toFixed(2);
          ticking = false;
        });
      };
      document.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ===== Research tag stagger reveal ===== */
    const tags = document.querySelectorAll('.research-tag');
    tags.forEach((tag, i) => {
      tag.classList.add('fancy-tag-reveal');
      tag.style.transitionDelay = (i * 60) + 'ms';
    });
    if (tags.length && 'IntersectionObserver' in window) {
      const tagIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fancy-tag-revealed');
            tagIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      tags.forEach((tag) => tagIO.observe(tag));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function () {
  'use strict';

  /* ─── GSAP SETUP ─── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─── LENIS ─── */
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ─── CROSSFADE + KEN BURNS ─── */
  let activeSide  = 'a';
  let zoomToggle  = false;          // alterna zoom-out / zoom-in
  const bgA = document.getElementById('bgA');
  const bgB = document.getElementById('bgB');
  let currentBgSrc = './images/campo1.jpg';

  /* Duraciones y escalas del efecto */
  const ZOOM_DURATION = 11;         // segundos por imagen
  const SCALE_BIG     = 1.13;
  const SCALE_NORMAL  = 1.0;

  function startZoom(el, toggle) {
    gsap.killTweensOf(el, 'scale');
    if (toggle) {
      /* zoom OUT: empieza grande → termina normal */
      gsap.fromTo(el,
        { scale: SCALE_BIG },
        { scale: SCALE_NORMAL, duration: ZOOM_DURATION, ease: 'power1.inOut' }
      );
    } else {
      /* zoom IN: empieza normal → termina grande */
      gsap.fromTo(el,
        { scale: SCALE_NORMAL },
        { scale: SCALE_BIG,    duration: ZOOM_DURATION, ease: 'power1.inOut' }
      );
    }
  }

  /* Arranca el zoom en la primera imagen al cargar */
  startZoom(bgA, zoomToggle);

  function crossfadeTo(src) {
    if (!src || src === currentBgSrc) return;
    currentBgSrc = src;
    zoomToggle = !zoomToggle;       // alterna el sentido del zoom
    if (activeSide === 'a') {
      bgB.src = src;
      startZoom(bgB, zoomToggle);
      bgB.style.opacity = '1';
      bgA.style.opacity = '0';
      activeSide = 'b';
    } else {
      bgA.src = src;
      startZoom(bgA, zoomToggle);
      bgA.style.opacity = '1';
      bgB.style.opacity = '0';
      activeSide = 'a';
    }
  }

  /* preload all images */
  const sectionsWithBg = document.querySelectorAll('[data-bg]');
  const preloaded = new Set(['./images/campo1.jpg']);
  sectionsWithBg.forEach(function (s) {
    var src = s.dataset.bg;
    if (src && !preloaded.has(src)) {
      new Image().src = src;
      preloaded.add(src);
    }
  });

  /* IntersectionObserver for crossfade */
  const bgObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) crossfadeTo(e.target.dataset.bg);
    });
  }, { threshold: 0.25 });
  sectionsWithBg.forEach(function (s) { bgObs.observe(s); });

  /* ─── PROGRESS BAR ─── */
  const progressBar = document.getElementById('progress-bar');
  const mainNav     = document.getElementById('main-nav');

  lenis.on('scroll', function (e) {
    progressBar.style.width = (e.progress * 100) + '%';
    mainNav.classList.toggle('solid', e.scroll > 80);
  });

  /* ─── MOBILE NAV ─── */
  const burger   = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');

  burger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    burger.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      burger.classList.remove('active');
    });
  });

  /* ─── SMOOTH NAV SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      }
    });
  });

  /* ─── HERO ENTRANCE ─── */
  gsap.from('.hero-el', {
    autoAlpha: 0,
    y: 44,
    duration: 1.05,
    ease: 'power2.out',
    stagger: 0.15,
    delay: 0.35,
  });

  /* ─── PARALLAX ─── */
  gsap.to('#bgA, #bgB', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  /* ─── HERO TITLE SCALE ─── */
  /* Hero title: slow blur-to-sharp reveal on load */
  gsap.from('.hero-title', {
    filter: 'blur(18px)',
    duration: 2.2,
    ease: 'power2.out',
    delay: 0.6,
    clearProps: 'filter',
  });

  /* ─── HOTELERIA / FEEDLOTS PIN ─── */
  gsap.matchMedia().add('(min-width: 769px)', function () {
    var feedlotTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hoteleria-pin-inner',
        pin: true,
        start: 'top top',
        end: '+=120%',
        scrub: 2,
        onUpdate: function (self) {
          if (self.progress >= 0.52) {
            crossfadeTo('./images/feedlot2.jpg');
          } else {
            crossfadeTo('./images/feedlot1.jpg');
          }
        },
      },
    });
    feedlotTl
      /* 1. Left (hotelería) slides in from below */
      .fromTo('#slide-hoteleria',
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.45 }
      )
      /* 2. Right (feedlots) slides in — left stays visible */
      .fromTo('#slide-feedlots',
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.45 },
        '+=0.25'
      );
  });

  /* ─── CONSIGNATARIA / REPRESENTANTES PIN ─── */
  gsap.matchMedia().add('(min-width: 769px)', function () {
    var consigTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#consig-pin-inner',
        pin: true,
        start: 'top top',
        end: '+=120%',
        scrub: 2,
      },
    });
    consigTl
      .fromTo('#slide-consig',
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.45 }
      )
      .fromTo('#slide-reps',
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.45 },
        '+=0.25'
      );
  });

  /* ─── ABOUT PIN ─── */
  ScrollTrigger.create({
    trigger: '.about-section',
    pin: true,
    start: 'top top',
    end: '+=150%',
    pinSpacing: true,
  });

  gsap.to('.about-years', {
    scale: 1.35,
    opacity: 0.12,
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top top',
      end: '+=150%',
      scrub: 1.5,
    },
  });

  /* ─── REVEAL ANIMATIONS ─── */
  /* Collect hero elements to skip them */
  const heroEls = new Set(document.querySelectorAll('.hero-el'));

  gsap.utils.toArray('.reveal').forEach(function (el) {
    if (heroEls.has(el)) return;
    gsap.from(el, {
      autoAlpha: 0,
      y: 40,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.reveal-left').forEach(function (el) {
    gsap.from(el, {
      autoAlpha: 0,
      x: -40,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(function (el) {
    gsap.from(el, {
      autoAlpha: 0,
      x: 40,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* ─── ANIMATED COUNTERS ─── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function formatNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function animateCounter(el) {
    var target   = parseInt(el.dataset.count, 10);
    var prefix   = el.dataset.prefix || '';
    var start    = performance.now();
    var duration = 1800;

    function tick(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var value    = Math.round(easeOutCubic(progress) * target);
      el.textContent = prefix + formatNum(value);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  var counterEls = document.querySelectorAll('[data-count]');

  /* initialise display to 0 */
  counterEls.forEach(function (el) {
    el.textContent = (el.dataset.prefix || '') + '0';
  });

  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(function (el) { counterObs.observe(el); });

  /* ═══════════════════════════════════════════
     NUEVOS EFECTOS DE SCROLL
  ═══════════════════════════════════════════ */


  /* ─── GALERÍA HORIZONTAL PINNED ─── */
  (function () {
    var hTrack = document.getElementById('hscroll-track');
    if (!hTrack) return;

    /* Solo en desktop */
    var mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', function () {
      var dist = hTrack.scrollWidth - window.innerWidth;

      gsap.to(hTrack, {
        x: -dist,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hscroll-section',
          start: 'top top',
          end: '+=' + dist,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /* Cada imagen hace parallax interno */
      hTrack.querySelectorAll('.hscroll-item img').forEach(function (img) {
        gsap.fromTo(img,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hscroll-section',
              start: 'top top',
              end: '+=' + dist,
              scrub: 1,
            },
          }
        );
      });
    });
  }());


  /* ─── LÍNEAS DIVISORAS ─── */
  (function () {
    var lineObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('line-anim');
          lineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.line-divider').forEach(function (d) {
      lineObs.observe(d);
    });
  }());

  /* ─── PARALLAX EN IMÁGENES DE SECCIONES SÓLIDAS ─── */
  /* Las imágenes de las galerías hacen micro-parallax vertical al scrollear */
  gsap.utils.toArray('.clip-item img').forEach(function (img) {
    gsap.to(img, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.clip-item'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* ─── SCALE en cards: se añade encima del reveal ya existente ─── */
  /* Solo se anima scale (no opacity, para no conflictuar con .reveal) */
  gsap.utils.toArray('.service-card, .feedlot-card').forEach(function (card, i) {
    gsap.from(card, {
      scale: 0.93,
      duration: 0.7,
      ease: 'power2.out',
      delay: (i % 3) * 0.07,
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

})();
/* Cumay · interacciones y animaciones (GSAP + ScrollTrigger) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Menú (celular) ---------- */
const toggle = $('.nav__toggle');
const links = $('.nav__links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => {
  if (e.target.closest('a')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', false); }
});

/* ---------- Pestañas de competencias ---------- */
const tabs = $$('.skills__tab');
const selectTab = tab => {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
  });
  const panel = $('#' + tab.getAttribute('aria-controls'));
  if (window.gsap && !reduced()) {
    gsap.fromTo($$('.skill', panel), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .08, ease: 'power2.out' });
    gsap.fromTo($$('.chips li', panel), { scale: .7, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, stagger: .025, delay: .1, ease: 'back.out(2)' });
  }
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus(); selectTab(next);
  });
});

/* ---------- Preguntas frecuentes: apertura suave ---------- */
$$('.qa').forEach(d => d.addEventListener('toggle', () => {
  if (d.open && window.gsap && !reduced())
    gsap.fromTo($('.qa__a', d), { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .35, ease: 'power2.out', clearProps: 'height' });
}));

/* ---------- Formulario (solo front-end: conectar a un servicio de email) ---------- */
const form = $('#signup');
const msg = $('#signupMsg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = 'Revisa tu correo, parece que falta algo 🙂';
    return;
  }
  msg.textContent = '¡Gracias! Te avisaremos muy pronto ♥';
  form.reset();
});
$('#year').textContent = new Date().getFullYear();

/* ======================================================
   GSAP
   ====================================================== */
window.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  if (!location.hash) { ScrollTrigger.clearScrollMemory('manual'); scrollTo(0, 0); }

  // Estado final explícito: un from() con ScrollTrigger puede tomar como final su propio
  // estado inicial si la página se recalcula antes de que arranque.
  const RESET = { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1 };
  const fromIn = (t, v) => {
    const f = {}, to = {};
    for (const k in v) { if (k in RESET) { f[k] = v[k]; to[k] = RESET[k]; } else to[k] = v[k]; }
    return gsap.fromTo(t, f, to);
  };
  const enter = (trigger, start = 'top 85%') => ({ trigger, start, toggleActions: 'play none none none' });

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', narrow: '(max-width: 860px)' }, ctx => {
    const { motion, narrow } = ctx.conditions;
    if (!motion) return;
    root.classList.add('js-anim');

    /* ----- La caja va primero: su sección se fija y desplaza a las de abajo ----- */
    initBox(narrow);

    /* ----- Hero: título palabra por palabra ----- */
    const title = $('.hi-title');
    const wrapWords = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p.trim()) { frag.append(p); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    if (!title.dataset.split) { wrapWords(title); title.dataset.split = '1'; }
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.hi-title .w', { yPercent: 80, rotation: 7, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .85, stagger: .06, ease: 'back.out(1.6)' }, .1)
      .fromTo('.hi.lead', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .7)
      .fromTo('.hi.hero__cta', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .85);

    /* ----- Hero: ondas que se mueven ----- */
    $$('.wave').forEach((w, i) => {
      gsap.to(w, { attr: { d: w.dataset.b }, duration: 7 + i * 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });

    /* ----- Hero: libros que flotan ----- */
    const flies = $$('.fly');
    gsap.fromTo(flies, { y: 160, opacity: 0, scale: .8 }, { y: 0, opacity: 1, scale: 1, duration: 1.4, stagger: .15, ease: 'expo.out', delay: .2 });
    flies.forEach((f, i) => {
      const inner = $('.b3d__in', f);
      gsap.to(inner, { y: i % 2 ? 16 : -18, rotationZ: '+=3', duration: 3.2 + i * .7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .4 });
      // cada libro sube a su propia velocidad al hacer scroll
      gsap.to(f, { yPercent: -40 - i * 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    if (!narrow) {
      const qs = flies.map(f => [gsap.quickTo(f, 'x', { duration: 1, ease: 'power3' }), gsap.quickTo(f, 'rotationY', { duration: 1, ease: 'power3' })]);
      const onMove = e => {
        const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
        qs.forEach(([qx, qr], i) => { qx(dx * (30 + i * 20)); qr(dx * 12 + dy * 4); });
      };
      $('.hero').addEventListener('pointermove', onMove);
    }

    /* ----- Bloques de color: entran como páginas que se apilan ----- */
    $$('.slab').forEach(el => {
      if (el.matches('.boxsec')) return;
      gsap.fromTo(el, { scale: .93, y: 60 }, { scale: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: .6 } });
    });

    /* ----- Títulos y notas a mano ----- */
    $$('.big').forEach(h => { if (!h.closest('.boxsec')) fromIn(h, { y: 50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: enter(h, 'top 88%') }); });
    $$('.hand').forEach(h => { if (!h.closest('.boxsec')) fromIn(h, { opacity: 0, scale: .7, rotation: -14, duration: .7, ease: 'back.out(2)', scrollTrigger: enter(h, 'top 90%') }); });
    fromIn('.mayeutica__text p', { y: 30, opacity: 0, duration: .8, stagger: .15, ease: 'power3.out', scrollTrigger: enter('.mayeutica__text') });

    /* ----- Catálogo ----- */
    initShelf(narrow);

    /* ----- Pasos: el mazo de tarjetas se abre ----- */
    const scards = $$('.scard');
    const rest = narrow ? [-2, 1.5, -1] : [-3, 2, -1.5];
    const restY = narrow ? [0, 0, 0] : [0, 22, 0];
    scards.forEach((c, i) => gsap.fromTo(c,
      { xPercent: narrow ? 0 : (1 - i) * 100, y: narrow ? 80 : 70 + i * 10, rotation: (i - 1) * 12, scale: .9 },
      { xPercent: 0, y: restY[i], rotation: rest[i], scale: 1, ease: 'power2.out',
        scrollTrigger: { trigger: narrow ? c : '.cards3', start: 'top 92%', end: narrow ? 'top 55%' : 'top 35%', scrub: .7 } }));

    /* ----- Palabras gigantes: se encienden al pasar por el centro ----- */
    $$('.words__list li').forEach(li => ScrollTrigger.create({ trigger: li, start: 'top 62%', end: 'bottom 38%', toggleClass: 'on' }));
    fromIn('.skills__panel:not([hidden]) .chips li', { scale: .7, opacity: 0, duration: .35, stagger: .03, ease: 'back.out(2)', scrollTrigger: enter('.skills', 'top 75%') });

    /* ----- ¿Por qué Cumay?: las pastillas caen y rebotan ----- */
    const CHIP_R = [-6, 4, -2, 7, -4, 3];
    gsap.fromTo('.chip', { y: -420, rotation: () => gsap.utils.random(-50, 50), opacity: 0 },
      { y: 0, rotation: i => CHIP_R[i % CHIP_R.length], opacity: 1, duration: 1.3, stagger: .12, ease: 'bounce.out', scrollTrigger: enter('.chips-pile', 'top 80%') });

    /* ----- Programa ----- */
    gsap.fromTo('.ages__fill', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut', scrollTrigger: enter('.ages', 'top 80%') });
    fromIn('.ages__marks li', { scale: 0, opacity: 0, duration: .5, stagger: .18, ease: 'back.out(2.5)', delay: .2, scrollTrigger: enter('.ages', 'top 80%') });
    fromIn('.why__text > *', { y: 30, opacity: 0, duration: .7, stagger: .12, ease: 'power3.out', scrollTrigger: enter('.why') });
    fromIn('.pillar', { y: 60, opacity: 0, duration: .8, stagger: .08, ease: 'back.out(1.5)', scrollTrigger: enter('.pillars__grid') });

    /* ----- Autora y preguntas ----- */
    fromIn('.author__badge', { scale: 0, rotation: -40, duration: 1, ease: 'elastic.out(1,.55)', scrollTrigger: enter('.author', 'top 80%') });
    fromIn('.qa', { y: 30, opacity: 0, duration: .6, stagger: .08, ease: 'power2.out', scrollTrigger: enter('.faq__list') });

    /* ----- Un abrazo más: el texto cruza la pantalla, luego aparece el libro ----- */
    gsap.fromTo('.hug__line span', { xPercent: narrow ? 20 : 45 }, { xPercent: narrow ? -75 : -55, ease: 'none',
      scrollTrigger: { trigger: '.hug', start: 'top bottom', end: 'bottom top', scrub: .5 } });
    fromIn('.hug__copy > *', { y: 30, opacity: 0, duration: .8, stagger: .15, ease: 'power3.out', scrollTrigger: enter('.hug__copy', 'top 85%') });
    fromIn('.b3d--hug', { y: 160, rotation: -24, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: enter('.hug__book', 'top 80%') });
    gsap.to('.b3d--hug .b3d__in', { y: -16, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    /* ----- Pie: el libro asoma desde abajo ----- */
    fromIn('.b3d--foot', { y: 220, rotation: 14, duration: 1.4, ease: 'expo.out', scrollTrigger: enter('.footer', 'top 75%') });
    gsap.to('.b3d--foot .b3d__in', { y: -14, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => root.classList.remove('js-anim');
  });

  /* ---------- Catálogo: tarjetas a distintas alturas que se reacomodan con las flechas ---------- */
  function initShelf(narrow) {
    const track = $('#shelf');
    const cards = $$('.bk', track);
    const prev = $('.shelf__nav [data-dir="-1"]'), next = $('.shelf__nav [data-dir="1"]');
    const WAVE = [-26, 22, -8, 30, -20, 12]; // alturas alternadas, como un estante desordenado
    const TILT = [-1.5, 1.2, -.6, 1.6, -1, .8];
    fromIn(cards, { x: 220, rotation: 8, opacity: 0, duration: 1, stagger: .1, ease: 'back.out(1.3)', scrollTrigger: enter(track, 'top 85%') });
    if (narrow) return;
    let index = 0;
    const step = () => cards[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 28);
    const maxIndex = () => {
      const vw = $('.shelf__viewport').clientWidth;
      const visible = Math.max(1, Math.floor((vw - 40) / step()));
      return Math.max(0, cards.length - visible);
    };
    const place = (animate = true) => {
      index = gsap.utils.clamp(0, maxIndex(), index);
      const d = animate ? .9 : 0;
      gsap.to(track, { x: -index * step(), duration: d, ease: 'power3.inOut' });
      cards.forEach((c, i) => {
        const k = (i - index + WAVE.length * 10) % WAVE.length;
        gsap.to(c, { y: WAVE[k], rotation: TILT[k], duration: d * 1.2, delay: animate ? Math.abs(i - index) * .04 : 0, ease: 'elastic.out(1,.7)' });
      });
      prev.disabled = index === 0;
      next.disabled = index >= maxIndex();
    };
    // posición inicial escalonada sin pisar la animación de entrada
    ScrollTrigger.create({ trigger: track, start: 'top 85%', once: true, onEnter: () => gsap.delayedCall(1.6, () => place(true)) });
    prev.addEventListener('click', () => { index--; place(); });
    next.addEventListener('click', () => { index++; place(); });
    window.addEventListener('resize', () => place(false));
    prev.disabled = true;
  }

  /* ---------- La caja: se abre con el scroll y Ardillín sale de adentro ---------- */
  function initBox(narrow) {
    const sec = $('.boxsec');
    const inn = $('.box3d__in');
    const cs = getComputedStyle(inn);
    const bh = parseFloat(cs.getPropertyValue('--bh')) || 150;
    const t = parseFloat(getComputedStyle($('.b3d--box')).getPropertyValue('--t')) || 34;
    const rest = { '--open': '0deg', '--by': (bh / 2 - t / 2 - 3) + 'px', '--bx': '90deg', '--bry': '0deg', '--bz': '0deg' };
    gsap.set(inn, rest);
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: narrow
        ? { trigger: sec, start: 'top 70%', end: 'bottom 40%', scrub: .6 }
        : { trigger: sec, start: 'top top', end: () => '+=' + Math.min(innerHeight, 1000) * 1.8, pin: true, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true }
    });
    tl.fromTo('.box3d', { y: 90, rotation: -3 }, { y: 0, rotation: 0, duration: 1 }, 0)
      .fromTo('.boxsec__copy > *', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .15 }, .1)
      .fromTo('.box3d__shadow', { scale: .8, opacity: .6 }, { scale: 1, opacity: 1, duration: 1 }, 0)
      // la tapa se levanta con un pequeño rebote
      .to(inn, { '--open': '112deg', duration: 1.3, ease: 'back.out(1.4)' }, .9)
      // el libro sale de la caja, se endereza y gira para mostrar su lomo
      .to(inn, { '--by': (-bh * 1.4) + 'px', duration: 1.4, ease: 'power3.out' }, 1.8)
      .to(inn, { '--bx': '-4deg', duration: 1.2, ease: 'power2.inOut' }, 2.0)
      .to(inn, { '--bry': '-16deg', '--bz': '-4deg', duration: 1.2, ease: 'power2.inOut' }, 2.3)
      .fromTo('.boxsec__note', { opacity: 0, scale: .6, rotation: -20 }, { opacity: 1, scale: 1, rotation: -8, duration: .6, ease: 'back.out(2)' }, 2.8)
      .to({}, { duration: .6 });
    // flotación suave del libro una vez fuera
    gsap.to('.b3d--box .b3d__in', { y: -10, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  }
});

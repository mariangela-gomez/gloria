/* Cumay · interacciones y animaciones (GSAP + ScrollTrigger) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Menú móvil ---------- */
const toggle = $('.nav__toggle');
const links = $('.nav__links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => {
  if (e.target.closest('a')) {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
  }
});

/* ---------- Preguntas mayéuticas (todas las tarjetas) ---------- */
const questions = [ // una por competencia del programa
  '¿Qué haces cuando te enojas mucho? ¿Qué te ayuda a calmarte?',
  '¿Qué sientes cuando algo no te sale? ¿Lo vuelves a intentar?',
  '¿Qué te da vergüenza? ¿Cómo podrías animarte?',
  '¿A quién extrañas cuando no está contigo?',
  '¿Cómo te das cuenta de que un amigo está triste?',
  '¿Cómo le pides algo a alguien sin gritar?',
  '¿Qué puedes decir cuando algo de tu cuerpo no quieres que lo toquen?',
  '¿Cómo podemos jugar todos juntos aunque seamos distintos?'
];
let qi = 0;
const qCards = $$('.question');
const nextQuestion = () => {
  const texts = qCards.map(c => $('.question__text', c));
  texts.forEach(t => t.classList.add('out'));
  setTimeout(() => {
    qi = (qi + 1) % questions.length;
    texts.forEach(t => { t.textContent = questions[qi]; t.classList.remove('out'); });
  }, 250);
};
$$('.q-page').forEach(p => p.addEventListener('click', e => {
  if (!e.target.closest('.question')) nextQuestion(); // en 3D el clic a veces lo recibe la página
}));
qCards.forEach(c => {
  c.addEventListener('click', nextQuestion);
  c.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextQuestion(); }
  });
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
  if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

/* ---------- Catálogo: flechas y arrastre ---------- */
const shelf = $('#shelf');
if (shelf) {
  const step = () => ($('.bk', shelf)?.offsetWidth || 280) + 22;
  $$('.shelf__nav .round').forEach(b => b.addEventListener('click', () =>
    shelf.scrollBy({ left: step() * +b.dataset.dir, behavior: 'smooth' })));
  let down = null;
  shelf.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = { x: e.clientX, left: shelf.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 4) { down.moved = true; shelf.classList.add('drag'); }
    shelf.scrollLeft = down.left - dx;
  });
  window.addEventListener('pointerup', () => { down = null; shelf.classList.remove('drag'); });
}

/* ---------- Preguntas frecuentes: apertura suave ---------- */
$$('.qa').forEach(d => d.addEventListener('toggle', () => {
  if (d.open && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)
    gsap.from($('.qa__a', d), { height: 0, opacity: 0, duration: .35, ease: 'power2.out', clearProps: 'height' });
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

/* ---------- Inclinación del libro estático (móvil / sin animaciones) ---------- */
const staticBook = $('#book');
const stage = $('.hero__book');
if (matchMedia('(hover:hover)').matches) {
  stage.addEventListener('pointermove', e => {
    if (document.documentElement.classList.contains('js-book')) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    staticBook.style.transform = `perspective(1200px) rotateY(${x * 22 - 6}deg) rotateX(${4 - y * 14}deg) scale(1.03)`;
    staticBook.style.animationPlayState = 'paused';
  });
  stage.addEventListener('pointerleave', () => {
    staticBook.style.transform = '';
    staticBook.style.animationPlayState = '';
  });
}

/* ======================================================
   GSAP
   ====================================================== */
window.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  if (!location.hash) { ScrollTrigger.clearScrollMemory('manual'); scrollTo(0, 0); }
  let mm = gsap.matchMedia();

  // El libro fijo necesita que la ventana tenga su propio scroll. Si la página está dentro
  // de un marco que se estira al alto del contenido (algunas vistas previas), no hay scroll
  // propio: en ese caso se usan las secciones normales.
  // Solo aplica dentro de un iframe: abierta directamente en el navegador siempre hay scroll
  // propio (con el zoom reducido la ventana puede "medir" más que la pantalla).
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const frameScrolls = () => !inFrame ||
    (innerHeight <= (screen.availHeight || innerHeight) + 80 && root.scrollHeight > innerHeight * 1.5);
  let lastFrame = frameScrolls();
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const now = frameScrolls();
      if (now !== lastFrame) { lastFrame = now; mm.revert(); mm = gsap.matchMedia(); setup(); }
    }, 200);
  });

  const setup = () => mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', narrow: '(max-width: 860px)' },
    ctx => {
      const { motion, narrow } = ctx.conditions;
      if (!motion) return;

      root.classList.add('js-anim');

      /* ----- El cuento baja desde el hero y se abre ----- */
      // Se crea primero: ScrollTrigger calcula las posiciones en orden de creación, y la
      // sección fijada desplaza todo lo que viene después.
      let cleanupBook = () => {};
      // solo en pantallas anchas: en el celular el libro fijo taparía el texto al bajar
      if (!narrow && frameScrolls()) cleanupBook = initBook();

      // Estado final explícito: un from() con ScrollTrigger puede tomar como final su propio
      // estado inicial si la página se recalcula antes de que arranque (pasa con la sección fija).
      const RESET = { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1 };
      const fromIn = (t, v) => {
        const f = {}, to = {};
        for (const k in v) { if (k in RESET) { f[k] = v[k]; to[k] = RESET[k]; } else to[k] = v[k]; }
        return gsap.fromTo(t, f, to);
      };

      /* ----- Entrada del hero ----- */
      const title = $('.hi-title');
      // separa el título en palabras (conservando <em>)
      const wrapWords = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(p => {
              if (!p.trim()) { frag.append(p); return; }
              const s = document.createElement('span');
              s.className = 'w'; s.textContent = p; frag.append(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) wrapWords(n);
        });
      };
      if (!title.dataset.split) { wrapWords(title); title.dataset.split = '1'; }

      const draw = $('.hand--hero .draw');
      if (draw) { const L = draw.getTotalLength(); gsap.set(draw, { strokeDasharray: L, strokeDashoffset: L }); }
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.hi.pill', { y: 20, scale: .8, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .6 }, 0)
        .fromTo('.hi-title .w', { yPercent: 70, rotation: 6, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .8, stagger: .06, ease: 'back.out(1.7)' }, .1)
        .fromTo('.hi.lead', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .6)
        .fromTo('.hi.hero__cta', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .75)
        .set('.hi.hero__facts', { opacity: 1 }, .9)
        .fromTo('.hi.hero__facts li', { y: 20, scale: .8, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .5, stagger: .08, ease: 'back.out(2)' }, .9)
        .fromTo('.hand--hero', { opacity: 0, scale: .6, rotation: -20 }, { opacity: 1, scale: 1, rotation: -8, duration: .6, ease: 'back.out(2)' }, 1.4)
        .to(draw || {}, { strokeDashoffset: 0, duration: .7, ease: 'power2.inOut' }, 1.7);

      // formas orgánicas que respiran
      gsap.to('.blob--1', { rotation: 360, duration: 80, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.to('.blob--2', { rotation: -360, scale: 1.12, duration: 60, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });

      /* ----- Bloques de color: entran como páginas que se apilan ----- */
      $$('.slab').forEach(el => {
        if (el.matches('.hero, .story')) return;
        gsap.fromTo(el, { scale: .93, y: 60, borderRadius: 90 }, { scale: 1, y: 0, borderRadius: getComputedStyle(el).borderTopLeftRadius, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: .6 } });
      });

      /* ----- Revelados genéricos ----- */
      gsap.set('.reveal', { opacity: 0, y: 44 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 90%', once: true,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out', overwrite: true })
      });
      $$('.big').forEach(h => fromIn(h, { y: 50, opacity: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: 'play none none none' } }));
      $$('.hand:not(.hi)').forEach(h => fromIn(h, { opacity: 0, scale: .7, rotation: -14, duration: .7, ease: 'back.out(2)',
        scrollTrigger: { trigger: h, start: 'top 90%', toggleActions: 'play none none none' } }));

      /* ----- Catálogo: las tarjetas llegan deslizándose ----- */
      fromIn('.bk', { x: 160, rotation: 6, opacity: 0, duration: .9, stagger: .1, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.shelf__track', start: 'top 85%', toggleActions: 'play none none none' } });

      /* ----- Pasos: el mazo de tarjetas se abre ----- */
      const scards = $$('.scard');
      const rest = narrow ? [{ r: -2, y: 0 }, { r: 1.5, y: 0 }, { r: -1, y: 0 }] : [{ r: -3, y: 0 }, { r: 2, y: 18 }, { r: -1.5, y: 0 }];
      scards.forEach((c, i) => gsap.fromTo(c,
        { xPercent: narrow ? 0 : (1 - i) * 100, y: narrow ? 80 : 60 + i * 10, rotation: (i - 1) * 12, scale: .9 },
        { xPercent: 0, y: rest[i].y, rotation: rest[i].r, scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: narrow ? c : '.cards3', start: 'top 92%', end: narrow ? 'top 55%' : 'top 35%', scrub: .7 } }));

      /* ----- Palabras gigantes: se encienden al pasar por el centro ----- */
      $$('.words__list li').forEach(li => ScrollTrigger.create({
        trigger: li, start: 'top 62%', end: 'bottom 38%', toggleClass: 'on'
      }));

      /* ----- Por qué Cumay: las pastillas caen y rebotan ----- */
      const CHIP_R = [-6, 4, -2, 7, -4, 3]; // mismas inclinaciones que en el CSS
      gsap.fromTo('.chip', { y: -420, rotation: () => gsap.utils.random(-50, 50), opacity: 0 },
        { y: 0, rotation: i => CHIP_R[i % CHIP_R.length], opacity: 1, duration: 1.3, stagger: .12, ease: 'bounce.out',
          scrollTrigger: { trigger: '.chips-pile', start: 'top 80%', toggleActions: 'play none none none' } });

      /* ----- Ardillín y autora ----- */
      gsap.fromTo('.feature__cover', { rotation: -16, y: 80, scale: .85 }, { rotation: -5, y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '#cuento', start: 'top 90%', end: 'center 55%', scrub: .8 } });
      fromIn('.badge', { scale: 0, duration: 1, ease: 'elastic.out(1,.5)', scrollTrigger: { trigger: '.feature__art', start: 'top 75%', toggleActions: 'play none none none' } });
      fromIn('.ticks li', { x: -24, opacity: 0, duration: .6, stagger: .15, ease: 'power2.out',
        scrollTrigger: { trigger: '.ticks', start: 'top 85%', toggleActions: 'play none none none' } });
      fromIn('.author__badge', { scale: 0, rotation: -40, duration: 1, ease: 'elastic.out(1,.55)',
        scrollTrigger: { trigger: '.author', start: 'top 80%', toggleActions: 'play none none none' } });
      fromIn('.qa', { y: 30, opacity: 0, duration: .6, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: '.faq__list', start: 'top 85%', toggleActions: 'play none none none' } });

      /* ----- Programa ----- */
      gsap.fromTo('.ages__fill', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.ages', start: 'top 80%', toggleActions: 'play none none none' } });
      fromIn('.ages__marks li', { scale: 0, opacity: 0, duration: .5, stagger: .18, ease: 'back.out(2.5)', delay: .2,
        scrollTrigger: { trigger: '.ages', start: 'top 80%', toggleActions: 'play none none none' } });
      fromIn('.pillar', { y: 60, rotation: () => gsap.utils.random(-6, 6), opacity: 0, duration: .8, stagger: .08, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.pillars__grid', start: 'top 85%', toggleActions: 'play none none none' } });
      fromIn('.skills__panel:not([hidden]) .chips li', { scale: .7, opacity: 0, duration: .35, stagger: .03, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.skills', start: 'top 75%', toggleActions: 'play none none none' } });


      return () => {
        cleanupBook();
        root.classList.remove('js-anim');
      };
    }
  );
  setup();

  function initBook() {
    const W = 340, H = 451, NAV = 68; // NAV: alto del menú fijo
    const wrap = $('#flybook');
    const slot = $('#bookSlot');
    const float = $('.fb__float');
    const tilt = $('.fb__tilt');
    const lean = $('.fb__lean');
    const intro = $('.fb__intro');
    const leaves = [$('.leaf--0'), $('.leaf--1'), $('.leaf--2'), $('.leaf--3')];
    const [cover, leaf1, leaf2, leaf3] = leaves;
    const zs = [1.6, 1.2, .8, .4]; // grosor de las hojas (evita que se solapen)
    const g = { S: 1, sx: 0, sy: 0, ss: 1 };
    const measure = () => {
      const vw = innerWidth, vh = innerHeight;
      g.S = Math.min((vh - 150) / H, vw * .94 / (2 * W));
      const r = slot.getBoundingClientRect();
      const top = r.top + scrollY;
      g.sx = r.left + r.width / 2 - vw / 2;
      g.sy = top + r.height / 2 - vh / 2;
      g.ss = r.width / W;
    };
    measure();

    root.classList.add('js-book');
    gsap.set(wrap, { transformPerspective: 2600 });
    gsap.set(tilt, { transformPerspective: 3000 });
    // la perspectiva del pop-up nace en el lomo, para que las dos páginas se vean simétricas
    gsap.set(lean, { transformPerspective: 2300, transformOrigin: '0% 50%' });
    leaves.forEach((l, i) => gsap.set(l, { z: zs[i] }));
    wrap.classList.add('on');

    // cada cara se muestra solo cuando mira hacia el lector (así nada se transparenta)
    // fronts[4] es la última página derecha (fija). Solo se renderizan las dos páginas
    // a la vista y la hoja que está girando.
    const fronts = [...leaves.map(l => $('.face--f', l)), $('.pg--base')];
    const backs = leaves.map(l => $('.face--b', l));
    gsap.set([...backs, ...fronts.slice(1)], { visibility: 'hidden' });

    // figuras pop-up: acostadas sobre la página (rotationX 0), se levantan a -90°.
    // Se levantan de adelante hacia atrás; acostadas, las de adelante quedan encima.
    const order = ['.pu--acorn', '.pu--sq', '.pu--tree', '.pu--cloud', '.pu--sun', '.pu--hill'];
    const pops = order.flatMap(sel => $$(sel, wrap));
    const shadows = pops.map(p => {
      const sh = document.createElement('i');
      sh.className = 'pu__sh';
      sh.setAttribute('style', p.getAttribute('style'));
      p.parentNode.insertBefore(sh, p);
      return sh;
    });
    pops.forEach((p, i) => gsap.set(p, { rotationX: 0, z: (pops.length - i) * .04 }));

    // entrada del libro + flotación
    gsap.from(intro, { y: 90, opacity: 0, rotation: -10, scale: .8, duration: 1.1, ease: 'back.out(1.5)', delay: .5, clearProps: 'opacity' });
    const floating = gsap.to(float, { y: -14, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // inclinación con el mouse mientras está en el hero
    const rx = gsap.quickTo(tilt, 'rotationY', { duration: .6, ease: 'power3' });
    const ry = gsap.quickTo(tilt, 'rotationX', { duration: .6, ease: 'power3' });
    let inHero = true;
    const onMove = e => {
      if (!inHero) { rx(0); ry(0); return; }
      rx((e.clientX / innerWidth - .5) * 16);
      ry(-(e.clientY / innerHeight - .5) * 10);
    };
    window.addEventListener('pointermove', onMove);

    /* 1) vuelo: del hero al centro de la pantalla */
    const fly = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true, // sin retraso: si no, al saltar pisa la posición del libro abierto
        onRefreshInit: measure,
        onUpdate: self => {
          inHero = self.progress < .03;
          floating.timeScale(inHero ? 1 : 0);
          if (!inHero) gsap.to(tilt, { rotationX: 0, rotationY: 0, duration: .4, overwrite: true });
        }
      }
    });
    fly.fromTo(wrap,
      { x: () => g.sx, y: () => g.sy, scale: () => g.ss, rotationY: -14, rotationX: 4, rotation: -2 },
      { x: 0, y: NAV / 2, scale: () => g.S, rotationY: 0, rotationX: 0, rotation: 0, ease: 'power1.inOut' });

    /* 2) apertura: se fija la sección y el scroll abre el libro y levanta las figuras */
    const S2 = .9;                        // el libro se achica un poco al inclinarse
    const VH = () => Math.min(innerHeight, 1000); // largo de scroll acotado
    const open = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.story', start: 'top top', end: () => '+=' + VH() * 5.5,
        pin: true, scrub: .5, anticipatePin: 1, invalidateOnRefresh: true,
        onToggle: self => wrap.classList.toggle('live', self.isActive)
      }
    });
    const turn = (leaf, i, t) => {
      open
        .set(fronts[i + 1], { visibility: 'visible' }, t)
        .to(leaf, { rotationY: -180, z: -zs[i], duration: 1.2 }, t)
        .set(fronts[i], { visibility: 'hidden' }, t + .6)
        .set(backs[i], { visibility: 'visible' }, t + .6);
      if (i) open.set(backs[i - 1], { visibility: 'hidden' }, t + 1.2);
    };
    // cámara: escala y desplazamiento del libro. Con x=s·W/2 el lomo queda al centro.
    const cam = (t, k, d = 1, y = NAV / 2) =>
      open.to(wrap, { scale: () => g.S * (k.scale || 1), x: () => g.S * (k.scale || 1) * W * k.at, y, duration: d }, t);
    const SPREAD = { at: .5 };

    open
      .to('.story__cap', { opacity: 0, x: i => (i ? 40 : -40), duration: .5, ease: 'power1.in' }, 0)
      .to('.story__hint', { opacity: 0, duration: .3 }, 0);

    // tapa: se abre y la cámara muestra el libro completo
    turn(cover, 0, .2);
    cam(.2, SPREAD, 1.2);

    // escena pop-up: el libro se inclina y las figuras se levantan en capas
    open.fromTo(lean, { rotationX: 0 }, { rotationX: 44, duration: .9, immediateRender: false }, 1.4);
    cam(1.4, { at: .5, scale: S2 }, .9, NAV / 2 + 34);
    pops.forEach((p, i) => {
      const t = 1.9 + i * .12;
      open.to(p, { rotationX: -90, duration: .8, ease: 'back.out(1.6)' }, t);
      open.fromTo(shadows[i], { opacity: 0, scaleX: .4 }, { opacity: 1, scaleX: 1, duration: .8, immediateRender: false }, t);
    });
    // las figuras se pliegan y el libro vuelve a quedar plano
    open
      .to(pops, { rotationX: 0, duration: .6, stagger: { each: .04, from: 'end' }, ease: 'power2.in' }, 4.3)
      .to(shadows, { opacity: 0, duration: .4 }, 4.5)
      .to(lean, { rotationX: 0, duration: .8 }, 4.7);
    cam(4.7, SPREAD, .8);

    turn(leaf1, 1, 5.7); open.addLabel('que', 7.1);
    turn(leaf2, 2, 7.8); open.addLabel('como', 9.2);
    turn(leaf3, 3, 9.9);
    open.to({}, { duration: .9 }, 11.1);        // pausa breve en la última página

    /* 3) salida: al soltarse la sección, el libro sube junto con la página (sin huecos) */
    const exit = gsap.fromTo(wrap, { y: NAV / 2 }, {
      y: () => NAV / 2 - innerHeight * 1.05, ease: 'none', immediateRender: false,
      scrollTrigger: {
        trigger: '.story', start: () => open.scrollTrigger.end, end: () => open.scrollTrigger.end + innerHeight * 1.05,
        scrub: true, invalidateOnRefresh: true
      }
    });

    // enlaces del menú: llevan a la página correspondiente del libro
    const navHandlers = $$('[data-label]').map(a => {
      const h = e => {
        e.preventDefault();
        scrollTo({ top: open.scrollTrigger.labelToScroll(a.dataset.label) + 2, behavior: 'smooth' });
      };
      a.addEventListener('click', h);
      return [a, h];
    });

    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      navHandlers.forEach(([a, h]) => a.removeEventListener('click', h));
      shadows.forEach(sh => sh.remove());
      root.classList.remove('js-book');
      wrap.classList.remove('on', 'live');
    };
  }
});

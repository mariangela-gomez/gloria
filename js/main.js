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
    staticBook.style.transform = `rotateY(${x * 22 - 6}deg) rotateX(${4 - y * 14}deg) scale(1.03)`;
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
  const frameScrolls = () =>
    innerHeight <= (screen.availHeight || innerHeight) + 80 && root.scrollHeight > innerHeight * 1.5;
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

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.hi.pill', { y: 20, scale: .8, duration: .6, clearProps: 'transform' }, 0)
        .fromTo('.hi-title .w', { y: 46, rotation: 4, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: .8, stagger: .07 }, .1)
        .fromTo('.hi.pill', { opacity: 0 }, { opacity: 1, duration: .5 }, 0)
        .fromTo('.hi.lead', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .55)
        .fromTo('.hi.hero__cta', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .7)
        .fromTo('.hi.hero__facts li', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .1 }, .85)
        .set('.hi.hero__facts', { opacity: 1 }, .85);

      gsap.to('.cloud', { y: -30, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 1.2 });

      // colinas con parallax suave
      gsap.to('.hills', { y: 50, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      /* ----- Revelados al hacer scroll ----- */
      gsap.set('.reveal', { opacity: 0, y: 44 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: .9, stagger: .12, ease: 'power3.out', overwrite: true })
      });

      gsap.fromTo('.feature__cover',
        { rotation: -14, y: 70, scale: .85 },
        { rotation: -4, y: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: '#cuento', start: 'top 90%', end: 'center 55%', scrub: .8 } });
      gsap.from('.feature__copy > *', {
        y: 36, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out',
        scrollTrigger: { trigger: '.feature__copy', start: 'top 80%', once: true } });
      gsap.from('.ticks li', {
        x: -24, opacity: 0, duration: .6, stagger: .15, ease: 'power2.out',
        scrollTrigger: { trigger: '.ticks', start: 'top 85%', once: true } });
      gsap.from('.author__badge', {
        scale: 0, rotation: -40, duration: 1, ease: 'elastic.out(1,.55)',
        scrollTrigger: { trigger: '.author', start: 'top 80%', once: true } });
      gsap.from('.soon__item', {
        y: 40, opacity: 0, rotation: () => gsap.utils.random(-4, 4), duration: .8, stagger: .15, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.soon', start: 'top 85%', once: true } });

      // programa: la línea de edades se llena y los puntos aparecen
      gsap.fromTo('.ages__fill', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.ages', start: 'top 80%', once: true } });
      gsap.from('.ages__marks li', { scale: 0, opacity: 0, duration: .5, stagger: .18, ease: 'back.out(2.5)', delay: .2,
        scrollTrigger: { trigger: '.ages', start: 'top 80%', once: true } });
      gsap.from('.skills__panel:not([hidden]) .chips li', { scale: .7, opacity: 0, duration: .35, stagger: .03, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.skills', start: 'top 75%', once: true } });

      /* ----- El cuento baja desde el hero y se abre ----- */
      let cleanupBook = () => {};
      if (frameScrolls()) cleanupBook = initBook(narrow);

      return () => {
        cleanupBook();
        root.classList.remove('js-anim');
      };
    }
  );
  setup();

  function initBook(narrow) {
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
    const g = { S: 1, Sp: 1, Ss: 1, sx: 0, sy: 0, ss: 1 };
    const measure = () => {
      const vw = innerWidth, vh = innerHeight;
      if (narrow) {
        g.Sp = Math.min((vw - 28) / W, (vh - 150) / H); // una página a pantalla completa
        g.Ss = (vw - 16) / (2 * W);                      // el libro abierto completo
        g.S = g.Sp;
      } else {
        g.S = g.Sp = g.Ss = Math.min((vh - 150) / H, vw * .94 / (2 * W));
      }
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
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7, invalidateOnRefresh: true,
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
        trigger: '.story', start: 'top top', end: () => '+=' + VH() * (narrow ? 8 : 5.5),
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
    // cámara: escala y desplazamiento del libro. El centro de la página derecha es x=0,
    // el lomo es x=s·W/2 y el centro de la página izquierda es x=s·W.
    const cam = (t, s, k, d = 1, y = NAV / 2) =>
      open.to(wrap, { scale: () => g[s] * (k.scale || 1), x: () => g[s] * (k.scale || 1) * W * k.at, y, duration: d }, t);
    const SPREAD = { at: .5 }, LEFT = { at: 1 }, RIGHT = { at: 0 };

    open
      .to('.story__cap', { opacity: 0, x: i => (i ? 40 : -40), duration: .5, ease: 'power1.in' }, 0)
      .to('.story__hint', { opacity: 0, duration: .3 }, 0);

    // tapa: se abre y la cámara muestra el libro completo
    turn(cover, 0, .2);
    cam(.2, 'Ss', SPREAD, 1.2);

    // escena pop-up: el libro se inclina y las figuras se levantan en capas
    open.fromTo(lean, { rotationX: 0 }, { rotationX: 44, duration: .9, immediateRender: false }, 1.4);
    cam(1.4, 'Ss', { at: .5, scale: S2 }, .9, NAV / 2 + (narrow ? 20 : 34));
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
    cam(4.7, 'Ss', SPREAD, .8);

    if (!narrow) {
      // escritorio: se ven las dos páginas a la vez
      turn(leaf1, 1, 5.7); open.addLabel('que', 7.1);
      turn(leaf2, 2, 7.8); open.addLabel('como', 9.2);
      turn(leaf3, 3, 9.9);
      open.to({}, { duration: .9 }, 11.1);        // pausa breve en la última página
    } else {
      // móvil: la cámara se acerca a cada página para que el texto se lea
      turn(leaf1, 1, 5.7);
      cam(6.8, 'Sp', LEFT, .9); open.addLabel('que', 7.7);
      cam(8.4, 'Sp', RIGHT, .9);
      turn(leaf2, 2, 9.5);
      cam(10.6, 'Sp', LEFT, .9);
      cam(12.2, 'Sp', RIGHT, .9); open.addLabel('como', 13.1);
      turn(leaf3, 3, 13.8);
      cam(14.9, 'Sp', LEFT, .9);
      cam(16.5, 'Sp', RIGHT, .9);
      open.to({}, { duration: .6 }, 17.4);
    }

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

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
const questions = [
  '¿Qué crees que sintió Ardillín cuando todos lo miraron distinto?',
  '¿Qué es lo que más te gusta de ti?',
  'Si tu enojo fuera un animal, ¿cuál sería? ¿Cómo lo calmarías?',
  '¿Cuándo te has sentido muy valiente?',
  '¿Qué le dirías a un amigo que se siente triste?',
  '¿Qué cosa difícil lograste con paciencia?',
  '¿Qué pasaría si todos fuéramos iguales?',
  '¿Cómo cambia el cuento si lo cuentas tú?'
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
qCards.forEach(c => {
  c.addEventListener('click', nextQuestion);
  c.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextQuestion(); }
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
  const mm = gsap.matchMedia();

  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 861px)' },
    ctx => {
      const { motion, wide } = ctx.conditions;
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
        .set('.hi.hero__facts', { opacity: 1 }, .85)
        .fromTo('.sticker', { scale: 0, rotation: -30, opacity: 0 }, { scale: 1, rotation: 8, opacity: 1, duration: .7, ease: 'back.out(3)' }, 1.2);

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

      /* ----- El cuento baja desde el hero y se abre ----- */
      const tallEnough = root.scrollHeight > innerHeight * 1.5; // descarta marcos sin scroll propio
      let cleanupBook = () => {};
      if (wide && tallEnough) cleanupBook = initBook();

      return () => {
        cleanupBook();
        root.classList.remove('js-anim');
      };
    }
  );

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
    const zs = [3.6, 2.7, 1.8, .9]; // grosor de las hojas (evita que se solapen)
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
    gsap.set(lean, { transformPerspective: 1500, transformOrigin: '0% 50%' });
    leaves.forEach((l, i) => gsap.set(l, { z: zs[i] }));
    wrap.classList.add('on');

    // contenido de cada página: oculto hasta que el cuento llega a ella
    const content = sel => $$(sel + ' .pgc > *');
    const L1 = content('.leaf--1 .face--b'), R1 = content('.leaf--2 .face--f');
    const L2 = content('.leaf--2 .face--b'), R2 = content('.leaf--3 .face--f');
    const L3 = content('.leaf--3 .face--b'), R3 = content('.pg--base');
    gsap.set([L1, R1, L2, R2, L3, R3], { opacity: 0, y: 16 });

    // figuras pop-up: acostadas sobre la página (rotationX 0), se levantan a -90°
    const order = ['.pu--hill', '.pu--tree', '.pu--sun', '.pu--cloud', '.pu--sq', '.pu--acorn'];
    const pops = order.flatMap(sel => $$(sel, wrap));
    const shadows = pops.map(p => {
      const sh = document.createElement('i');
      sh.className = 'pu__sh';
      sh.setAttribute('style', p.getAttribute('style'));
      p.parentNode.insertBefore(sh, p);
      return sh;
    });
    gsap.set(pops, { rotationX: 0 });

    // entrada del libro + flotación
    gsap.from(intro, { y: 90, opacity: 0, rotation: -10, scale: .8, duration: 1.1, ease: 'back.out(1.5)', delay: .5, clearProps: 'opacity' });
    gsap.fromTo('.fb__sticker', { scale: 0, rotation: -30, opacity: 0 }, { scale: 1, rotation: 8, opacity: 1, duration: .7, ease: 'back.out(3)', delay: 1.7 });
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
    fly.fromTo('.fb__sticker', { opacity: 1, scale: 1 }, { opacity: 0, scale: .5, duration: .12, ease: 'power1.in', immediateRender: false }, 0);

    /* 2) apertura: se fija la sección y el scroll abre el libro y levanta las figuras */
    const shift = () => g.S * W / 2;
    const S2 = .9;                        // el libro se achica un poco al inclinarse
    const shift2 = () => g.S * S2 * W / 2;
    const open = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.story', start: 'top top', end: () => '+=' + innerHeight * 9.5,
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onToggle: self => wrap.classList.toggle('live', self.isActive)
      }
    });
    const stagger = (els, t) => open.to(els, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: 'power2.out' }, t);
    const turn = (leaf, i, t) => open.to(leaf, { rotationY: -180, z: -zs[i], duration: 1.3 }, t);

    open
      .to('.story__cap', { opacity: 0, x: i => (i ? 40 : -40), duration: .6, ease: 'power1.in' }, .1)
      .to('.story__hint', { opacity: 0, duration: .3 }, .1);

    // tapa
    open.fromTo(wrap, { x: 0 }, { x: shift, duration: 1.3, immediateRender: false }, .3);
    turn(cover, 0, .3);

    // escena pop-up: el libro se inclina y las figuras se levantan en capas
    open
      .fromTo(lean, { rotationX: 0 }, { rotationX: 44, duration: 1, immediateRender: false }, 1.7)
      .fromTo(wrap, { scale: () => g.S, x: shift, y: NAV / 2 },
        { scale: () => g.S * S2, x: shift2, y: NAV / 2 + 34, duration: 1, immediateRender: false }, 1.7);
    pops.forEach((p, i) => {
      const t = 2.5 + i * .15;
      open.to(p, { rotationX: -90, duration: .9, ease: 'back.out(1.6)' }, t);
      open.fromTo(shadows[i], { opacity: 0, scaleX: .4 }, { opacity: 1, scaleX: 1, duration: .9, immediateRender: false }, t);
    });
    // las figuras se pliegan y el libro vuelve a quedar plano
    open
      .to(pops, { rotationX: 0, duration: .7, stagger: { each: .05, from: 'end' }, ease: 'power2.in' }, 5.6)
      .to(shadows, { opacity: 0, duration: .5 }, 5.6)
      .to(lean, { rotationX: 0, duration: .9 }, 5.9)
      .to(wrap, { scale: () => g.S, x: shift, y: NAV / 2, duration: .9 }, 5.9);

    // hoja 1
    turn(leaf1, 1, 7);
    stagger(L1, 7.5); stagger(R1, 7.5);
    // hoja 2
    turn(leaf2, 2, 9.4);
    stagger(L2, 9.9); stagger(R2, 9.9);
    // hoja 3
    turn(leaf3, 3, 11.8);
    stagger(L3, 12.3); stagger(R3, 12.3);

    // despedida
    open
      .fromTo(wrap, { opacity: 1, y: NAV / 2 }, { opacity: 0, y: -90, duration: 1, ease: 'power2.in', immediateRender: false }, 14.7)
      .to({}, { duration: .2 });

    // enlaces del menú: llevan a la página correspondiente del libro
    const navHandlers = $$('[data-p]').map(a => {
      const h = e => {
        e.preventDefault();
        const st = open.scrollTrigger;
        scrollTo({ top: st.start + (st.end - st.start) * parseFloat(a.dataset.p), behavior: 'smooth' });
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

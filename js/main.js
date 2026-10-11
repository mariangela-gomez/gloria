document.documentElement.classList.remove('no-js');

// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
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

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Mayeutic questions
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
const q = document.getElementById('question');
const qText = document.getElementById('questionText');
let qi = 0;
const nextQuestion = () => {
  qText.classList.add('out');
  setTimeout(() => {
    qi = (qi + 1) % questions.length;
    qText.textContent = questions[qi];
    qText.classList.remove('out');
  }, 250);
};
q.addEventListener('click', nextQuestion);
q.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextQuestion(); }
});

// Book tilt follows pointer on desktop
const book = document.getElementById('book');
const stage = book.parentElement;
if (matchMedia('(hover:hover)').matches) {
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    book.style.transform = `rotateY(${x * 22 - 6}deg) rotateX(${4 - y * 14}deg) scale(1.03)`;
    book.style.animationPlayState = 'paused';
  });
  stage.addEventListener('pointerleave', () => {
    book.style.transform = '';
    book.style.animationPlayState = '';
  });
}

// Signup (front-end only: connect to your email service later)
const form = document.getElementById('signup');
const msg = document.getElementById('signupMsg');
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

document.getElementById('year').textContent = new Date().getFullYear();

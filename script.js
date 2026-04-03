const frases = [
  "have a nice day",
  "hiiii",
  "loool",
  "javimelezzio",
];

const fxLayer = document.getElementById('fx-layer');

const intro = document.getElementById('intro');
const envelope = document.getElementById('envelope');
const introHint = document.getElementById('intro-hint');
const continueBtn = document.getElementById('continue-btn');
const letterHearts = document.querySelector('.letter-hearts');

const app = document.getElementById('app');
const fraseContainer = document.getElementById('frase-container');
const heart = document.getElementById('heart');
const contador = document.getElementById('contador');

function rand(min, max){ return Math.random() * (max - min) + min; }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function createSpanHeart(className, color){
  const el = document.createElement('span');
  el.className = className;
  el.textContent = "❤";
  el.style.color = color ?? pick(["#89041c", "#ff0033", "#fb004f", "#ff3b30", "#bf0000"]);
  return el;
}

/* Letter decoration */
function decorateLetter(){
  if (!letterHearts) return;
  letterHearts.innerHTML = "";

  // hearts in the "corners" + a few random ones
  const fixed = [
    { x: 16,  y: 12,  s: 18 },
    { x: 320, y: 14,  s: 16 },
    { x: 30,  y: 150, s: 14 },
    { x: 280, y: 170, s: 14 },
    { x: 24,  y: 210, s: 16 },
    { x: 320, y: 210, s: 18 }
  ];

  const rect = envelope.getBoundingClientRect();
  const w = Math.max(240, rect.width * 0.9);
  const h = Math.max(160, rect.height * 0.82);

  function addMini(x, y, size){
    const el = document.createElement('span');
    el.className = "letter-mini-heart";
    el.textContent = "❤";
    el.style.left = `${Math.min(x, w - 20)}px`;
    el.style.top = `${Math.min(y, h - 20)}px`;
    el.style.fontSize = `${size}px`;
    el.style.animationDelay = `${Math.random() * 1.5}s`;
    letterHearts.appendChild(el);
  }

  fixed.forEach(p => addMini(p.x, p.y, p.s));

  for (let i = 0; i < 14; i++){
    addMini(rand(12, w - 24), rand(10, h - 24), rand(12, 18));
  }
}

/* Floating hearts */
function spawnFloatingHeart(){
  const h = createSpanHeart('float-heart');
  const size = rand(12, 42);
  const x = rand(0, 100);
  const drift = rand(-80, 80);
  const rot = rand(-40, 40);
  const scale = rand(0.7, 1.35);
  const duration = rand(7, 14);

  h.style.fontSize = `${size}px`;
  h.style.setProperty('--x', `${x}vw`);
  h.style.setProperty('--drift', `${drift}px`);
  h.style.setProperty('--r', `${rot}deg`);
  h.style.setProperty('--s', `${scale}`);
  h.style.animation = `floatUp ${duration}s linear forwards`;

  fxLayer.appendChild(h);
  h.addEventListener('animationend', () => h.remove());
}

let floatTimer = null;
function startFloatingHearts(){
  if (floatTimer) return;
  floatTimer = setInterval(spawnFloatingHeart, 240);
  for (let i=0; i<10; i++) spawnFloatingHeart();
}

/* Burst */
function burstHeartsAt(clientX, clientY, amount = 18){
  const rect = fxLayer.getBoundingClientRect();
  const x0 = clientX - rect.left;
  const y0 = clientY - rect.top;

  for(let i=0;i<amount;i++){
    const h = createSpanHeart('burst-heart');
    const size = rand(10, 26);
    const angle = rand(0, Math.PI * 2);
    const speed = rand(80, 260);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - rand(30, 140);
    const rot = rand(-60, 60);
    const scale = rand(0.8, 1.4);
    const dur = rand(650, 1100);

    h.style.fontSize = `${size}px`;
    h.style.setProperty('--x0', `${x0}px`);
    h.style.setProperty('--y0', `${y0}px`);
    h.style.setProperty('--vx', `${vx}px`);
    h.style.setProperty('--vy', `${vy}px`);
    h.style.setProperty('--r', `${rot}deg`);
    h.style.setProperty('--s', `${scale}`);
    h.style.animation = `burst ${dur}ms ease-out forwards`;

    fxLayer.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
}

/* Counter (time since a start date) */
function actualizarContador() {
  // Start timestamp (April 1, 2026 at 00:00:00).
  // We compute how much time has passed since this moment.
  const start = new Date('2026-04-01T00:00:00');

  // Current timestamp (now, from the user's device clock).
  const now = new Date();

  // Difference in milliseconds: now - start
  const diffMs = now - start;

  // Convert milliseconds to total whole seconds
  const totalSeconds = Math.floor(diffMs / 1000);

  // Break total seconds down into days/hours/minutes/seconds
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Update the DOM with a formatted string
  contador.textContent =
    `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds since April 1, 2026 ❤`;
}

// Update the counter every second so it stays live
setInterval(actualizarContador, 1000);
// Run once immediately
actualizarContador();

/* Intro state machine */
let introState = "closed"; // closed -> opened -> ready

function openEnvelope(){
  if (introState !== "closed") return;
  introState = "opened";

  envelope.classList.add('open');
  introHint.textContent = "Now press Continue ❤";

  decorateLetter();

  // burst from the center of the envelope
  const rect = envelope.getBoundingClientRect();
  burstHeartsAt(rect.left + rect.width/2, rect.top + rect.height/2, 26);
}

function enterApp(){
  if (introState !== "opened") return;
  introState = "ready";

  intro.classList.add('hidden');
  app.classList.remove('hidden');
  startFloatingHearts();
}

envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && introState === "closed") openEnvelope();
});

continueBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  enterApp();
});

window.addEventListener('resize', () => {
  if (introState === "opened") decorateLetter();
});

/* App clicks */
document.addEventListener('click', (ev) => {
  if (!app || app.classList.contains('hidden')) return;

  fraseContainer.textContent = pick(frases);

  heart.style.transform = 'translate(-50%, -50%) scale(1.8)';
  setTimeout(() => {
    heart.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 260);

  burstHeartsAt(ev.clientX, ev.clientY, 22);
});

/* ===== НАСТРОЙКИ ===== */
const CONFIG = {
  name: 'ЭЛЬВИНА',
  since: '2006-01-01T08:00:00',
  gameSeconds: 25,
  typed: [
    'игру с сердечками',
    'шар предсказаний',
    'письмо с секретом'
  ],
  ballAnswers: [
    'Определённо да ✨',
    'Да. И это даже не обсуждается',
    'Сначала чай ☕, потом решения',
    'Звёзды говорят: действуй',
    'Шансы высоки. Как всегда!',
    'Мама всегда права. Это закон вселенной',
    'Лучше завтра. Но завтра тоже «да»',
    'Спроси ещё раз, но с улыбкой 😄',
    'Вселенная одобряет 🌷',
    'Да, но возьми с собой тёплую кофту'
  ]
};

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

let mx = innerWidth / 2, my = innerHeight / 2;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

/* ===== ПРЕЛОАДЕР ===== */
let loadVal = 0;
const loadTimer = setInterval(() => {
  loadVal += Math.random() * 9 + 3;
  if (loadVal >= 100) {
    loadVal = 100;
    clearInterval(loadTimer);
    setTimeout(() => $('#preloader').classList.add('done'), 300);
  }
  $('#loaderNum').textContent = Math.floor(loadVal);
  $('#loaderBar').style.width = loadVal + '%';
}, 90);

/* ===== САЛЮТ / КОНФЕТТИ ===== */
const fx = $('#fx');
const fctx = fx.getContext('2d');
let fp = [], fxRun = false;

function fxResize() {
  fx.width = innerWidth;
  fx.height = innerHeight;
}
fxResize();
addEventListener('resize', fxResize);

function burst(x, y, n = 80) {
  const hue = Math.random() * 360;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 7 + 2;
    fp.push({
      x: x,
      y: y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      color: 'hsl(' + ((hue + Math.random() * 70) % 360) + ',100%,65%)',
      size: Math.random() * 3 + 1.5
    });
  }
  if (!fxRun) {
    fxRun = true;
    requestAnimationFrame(fxLoop);
  }
}

function fxLoop() {
  fctx.clearRect(0, 0, fx.width, fx.height);
  fp.forEach(p => {
    p.vy += 0.08;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    fctx.globalAlpha = Math.max(p.life, 0);
    fctx.fillStyle = p.color;
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.size, 0, 6.283);
    fctx.fill();
  });
  fctx.globalAlpha = 1;
  fp = fp.filter(p => p.life > 0);
  if (fp.length) requestAnimationFrame(fxLoop);
  else fxRun = false;
}

function fireworks(times = 8) {
  for (let i = 0; i < times; i++) {
    setTimeout(() => {
      burst(
        innerWidth * (0.15 + Math.random() * 0.7),
        innerHeight * (0.15 + Math.random() * 0.45),
        90
      );
    }, i * 380);
  }
}

/* ===== СЕРДЕЧКИ ПРИ КЛИКЕ ===== */
addEventListener('click', e => {
  const icons = ['❤', '💖', '🌷', '✨', '🌸', '💫'];
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span');
    s.className = 'floater';
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    s.style.setProperty('--dy', (Math.random() * 90 + 40) + 'px');
    s.style.setProperty('--r', (Math.random() * 80 - 40) + 'deg');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
});

/* ===== ВРАТА: ИМЯ ИЗ ЧАСТИЦ ===== */
const gateEl = $('#gate');
const gc = $('#gateCanvas');
const gctx = gc.getContext('2d');
let GWd, GHt, gp = [], exploded = false, gateAlive = true;

function buildName() {
  GWd = gc.width = innerWidth;
  GHt = gc.height = innerHeight;
  const off = document.createElement('canvas');
  off.width = GWd;
  off.height = GHt;
  const o = off.getContext('2d');
  o.font = '800 100px "Segoe UI",Arial';
  const w100 = o.measureText(CONFIG.name).width;
  const fs = Math.min(GWd * 0.86 / w100 * 100, 220);
  o.font = '800 ' + fs + 'px "Segoe UI",Arial';
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillStyle = '#fff';
  o.fillText(CONFIG.name, GWd / 2, GHt * 0.4);

  const gap = GWd < 700 ? 4 : 6;
  const data = o.getImageData(0, 0, GWd, GHt).data;
  gp = [];
  for (let y = 0; y < GHt; y += gap) {
    for (let x = 0; x < GWd; x += gap) {
      if (data[(y * GWd + x) * 4 + 3] > 128) {
        gp.push({
          x: Math.random() * GWd,
          y: Math.random() * GHt,
          tx: x,
          ty: y,
          vx: 0,
          vy: 0,
          hue: 330 + (x / GWd) * 80
        });
      }
    }
  }
}
buildName();
addEventListener('resize', () => {
  if (!exploded) buildName();
});

function gateLoop() {
  if (!gateAlive) return;
  gctx.clearRect(0, 0, GWd, GHt);
  for (const p of gp) {
    if (!exploded) {
      p.vx += (p.tx - p.x) * 0.035;
      p.vy += (p.ty - p.y) * 0.035;
      const dx = p.x - mx;
      const dy = p.y - my;
      const d = Math.hypot(dx, dy);
      if (d < 90 && d > 0) {
        p.vx += dx / d * 3.2;
        p.vy += dy / d * 3.2;
      }
      p.vx *= 0.86;
      p.vy *= 0.86;
    } else {
      p.vy += 0.12;
    }
    p.x += p.vx;
    p.y += p.vy;
    gctx.fillStyle = 'hsl(' + (p.hue % 360) + ',95%,68%)';
    gctx.fillRect(p.x, p.y, 2.6, 2.6);
  }
  requestAnimationFrame(gateLoop);
}
gateLoop();

/* ===== УДЕРЖАНИЕ СЕРДЦА ===== */
const holdBtn = $('#hold');
const holdBar = $('#holdBar');
let hp = 0, holding = false, unlocked = false;

function holdLoop() {
  if (unlocked) return;
  hp += holding ? 0.012 : -0.02;
  hp = Math.max(0, Math.min(1, hp));
  holdBar.style.strokeDashoffset = 327 * (1 - hp);
  holdBtn.style.transform = 'scale(' + (1 + hp * 0.25) + ')';
  if (hp >= 1) unlock();
  else requestAnimationFrame(holdLoop);
}
holdLoop();

holdBtn.addEventListener('pointerdown', e => {
  e.preventDefault();
  holding = true;
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
  holdBtn.addEventListener(ev, () => { holding = false; });
});
addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'Enter') holding = true;
});
addEventListener('keyup', e => {
  if (e.code === 'Space' || e.code === 'Enter') holding = false;
});

function unlock() {
  unlocked = true;
  exploded = true;
  gp.forEach(p => {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 14 + 3;
    p.vx = Math.cos(a) * s;
    p.vy = Math.sin(a) * s - 4;
  });
  gateEl.classList.add('open');
  document.body.classList.remove('locked');
  fireworks(7);
  setTimeout(() => {
    $('#title').classList.add('in');
    startTyping();
  }, 500);
  setTimeout(() => { gateAlive = false; }, 1600);
}

/* ===== ПЕЧАТАЮЩИЙСЯ ТЕКСТ ===== */
function startTyping() {
  const el = $('#typed');
  const words = CONFIG.typed;
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) {
      del = true;
      return setTimeout(tick, 1400);
    }
    if (del && c === 0) {
      del = false;
      w = (w + 1) % words.length;
    }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 45 : 90);
  })();
}

/* ===== КУРСОР ===== */
const dot = $('#cursorDot');
const ring = $('#cursorRing');
let rx = mx, ry = my;

addEventListener('mousemove', () => {
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
});
(function followRing() {
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(followRing);
})();
$$('a, button, .panel, input, .scratch, .envelope, .ball, .stat').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* ===== ФОНОВЫЕ ЧАСТИЦЫ ===== */
const canvas = $('#bg');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(110, Math.floor((W * H) / 15000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 1.8 + 0.6
  }));
}
resize();
addEventListener('resize', resize);

(function animate() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    const dx = p.x - mx;
    const dy = p.y - my;
    const d = Math.hypot(dx, dy);
    if (d < 140 && d > 0) {
      p.x += dx / d * 1.2;
      p.y += dy / d * 1.2;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      if (dist < 120) {
        ctx.strokeStyle = 'rgba(255,120,170,' + ((1 - dist / 120) * 0.3) + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
    if (d < 180) {
      ctx.strokeStyle = 'rgba(255,179,71,' + ((1 - d / 180) * 0.55) + ')';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mx, my);
      ctx.stroke();
    }
  }
  requestAnimationFrame(animate);
})();

/* ===== ШАПКА, ПРОГРЕСС, ПАРАЛЛАКС ===== */
const header = $('#header');
const progress = $('#progress');
const blobs = $$('.blob');
let lastY = 0;

addEventListener('scroll', () => {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? y / max * 100 : 0) + '%';
  header.classList.toggle('scrolled', y > 50);
  header.classList.toggle('hide', y > lastY && y > 400);
  lastY = y;
  blobs.forEach((b, i) => {
    b.style.translate = '0 ' + (y * (0.08 + i * 0.05)) + 'px';
  });
});

/* ===== МОБИЛЬНОЕ МЕНЮ ===== */
const burger = $('#burger');
const nav = $('#nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});
$$('a', nav).forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* ===== ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => io.observe(el));

/* ===== СЧЁТЧИКИ ===== */
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const dur = 2200;
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.floor(eased * target) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(step);
    })(start);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counterIO.observe(el));

/* ===== 3D-НАКЛОН КАРТОЧЕК ===== */
$$('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rotX = ((y / r.height) - 0.5) * -16;
    const rotY = ((x / r.width) - 0.5) * 16;
    card.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ===== МАГНИТНЫЕ КНОПКИ ===== */
$$('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
    el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ===== RIPPLE НА КНОПКАХ ===== */
$$('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });
});

/* ===== КУБ ДВИГАЕТСЯ ЗА МЫШЬЮ ===== */
addEventListener('mousemove', e => {
  const x = (e.clientX / innerWidth - 0.5) * 30;
  const y = (e.clientY / innerHeight - 0.5) * 30;
  $('#scene').style.transform = 'translate(' + x + 'px, ' + y + 'px)';
});

/* ===== ЖИВОЙ СЧЁТЧИК ВРЕМЕНИ ===== */
const since = new Date(CONFIG.since).getTime();
const tD = $('#tDays');
const tH = $('#tHours');
const tM = $('#tMin');
const tS = $('#tSec');
let lastSec = -1;

function updateTime() {
  const diff = Math.max(0, Date.now() - since);
  const s = Math.floor(diff / 1000);
  tD.textContent = Math.floor(s / 86400).toLocaleString('ru-RU');
  tH.textContent = Math.floor(s / 3600) % 24;
  tM.textContent = Math.floor(s / 60) % 60;
  tS.textContent = s % 60;
  if (s !== lastSec) {
    tS.classList.remove('bump');
    void tS.offsetWidth;
    tS.classList.add('bump');
    lastSec = s;
  }
}
updateTime();
setInterval(updateTime, 250);

/* ===== СКРЕТЧ-КАРТЫ ===== */
$$('.scratch').forEach(box => {
  const cv = $('canvas', box);
  const c = cv.getContext('2d');
  let done = false, drawing = false, lx = 0, ly = 0, moves = 0;

  function paint() {
    cv.width = box.clientWidth;
    cv.height = box.clientHeight;
    c.globalCompositeOperation = 'source-over';
    const grad = c.createLinearGradient(0, 0, cv.width, cv.height);
    grad.addColorStop(0, '#a9a3bd');
    grad.addColorStop(0.5, '#efeaf8');
    grad.addColorStop(1, '#8f8aa8');
    c.fillStyle = grad;
    c.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < 300; i++) {
      c.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.5) + ')';
      c.fillRect(Math.random() * cv.width, Math.random() * cv.height, 2, 2);
    }
    c.fillStyle = '#5a5572';
    c.font = '700 20px "Segoe UI",sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('✦ Сотри, чтобы узнать ✦', cv.width / 2, cv.height / 2);
  }
  paint();
  addEventListener('resize', () => {
    if (!done) paint();
  });

  function pos(e) {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  cv.addEventListener('pointerdown', e => {
    drawing = true;
    const p = pos(e);
    lx = p[0];
    ly = p[1];
    cv.setPointerCapture(e.pointerId);
    scratch(e);
  });
  cv.addEventListener('pointermove', scratch);
  ['pointerup', 'pointercancel'].forEach(ev => {
    cv.addEventListener(ev, () => { drawing = false; });
  });

  function scratch(e) {
    if (!drawing || done) return;
    const p = pos(e);
    c.globalCompositeOperation = 'destination-out';
    c.lineWidth = 48;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(lx, ly);
    c.lineTo(p[0], p[1]);
    c.stroke();
    lx = p[0];
    ly = p[1];
    moves++;
    if (moves % 6 === 0) check();
  }

  function check() {
    const d = c.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < d.length; i += 64) {
      total++;
      if (d[i] === 0) clear++;
    }
    if (clear / total > 0.5) {
      done = true;
      cv.classList.add('gone');
      const r = box.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 110);
    }
  }
});

/* ===== ИГРА «ЛОВИ СЕРДЕЧКИ» ===== */
const gcv = $('#gameCanvas');
const g = gcv.getContext('2d');
const overlay = $('#gameOverlay');
let GW, GH, items = [], basketX = 0, playing = false;
let score = 0, timeLeft = 0, lastSpawn = 0, lastT = 0, endAt = 0;

const kinds = [
  { e: '❤️', p: 1, w: 4 },
  { e: '🌷', p: 2, w: 2 },
  { e: '✨', p: 1, w: 2 },
  { e: '🥦', p: -2, w: 2 }
];

function gResize() {
  const r = gcv.getBoundingClientRect();
  GW = gcv.width = r.width;
  GH = gcv.height = r.height;
  if (!basketX) basketX = GW / 2;
}
gResize();
addEventListener('resize', gResize);

function pickKind() {
  const total = kinds.reduce((a, k) => a + k.w, 0);
  let r = Math.random() * total;
  for (const k of kinds) {
    r -= k.w;
    if (r <= 0) return k;
  }
  return kinds[0];
}

function moveBasket(clientX) {
  const r = gcv.getBoundingClientRect();
  basketX = Math.max(30, Math.min(GW - 30, clientX - r.left));
}
gcv.addEventListener('pointermove', e => moveBasket(e.clientX));
gcv.addEventListener('pointerdown', e => moveBasket(e.clientX));
addEventListener('keydown', e => {
  if (!playing) return;
  if (e.key === 'ArrowLeft') basketX = Math.max(30, basketX - 40);
  if (e.key === 'ArrowRight') basketX = Math.min(GW - 30, basketX + 40);
});

function startGame() {
  gResize();
  items = [];
  score = 0;
  lastSpawn = 0;
  playing = true;
  endAt = performance.now() + CONFIG.gameSeconds * 1000;
  $('#gScore').textContent = 0;
  overlay.classList.add('hidden');
  lastT = performance.now();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  playing = false;
  let title, text;
  if (score < 12) {
    title = 'Хорошая разминка 😄';
    text = 'Очков: ' + score + '. Брокколи победила этот раунд. Попробуем ещё?';
  } else if (score < 30) {
    title = 'Отличный результат! 🌷';
    text = 'Очков: ' + score + '. Сердечки в надёжных руках. Сможешь побить рекорд?';
  } else {
    title = 'РЕКОРД! 🏆';
    text = 'Очков: ' + score + '. Ловишь сердца профессионально. Салют заслужен!';
    fireworks(8);
  }
  $('#gameTitle').textContent = title;
  $('#gameText').textContent = text;
  $('#gameBtn span').textContent = 'Ещё раз';
  overlay.classList.remove('hidden');
}

function gameLoop(now) {
  if (!playing) return;
  const dt = Math.min((now - lastT) / 16.67, 3);
  lastT = now;
  timeLeft = Math.max(0, Math.ceil((endAt - now) / 1000));
  $('#gTime').textContent = timeLeft;
  if (now >= endAt) {
    drawGame();
    endGame();
    return;
  }

  const prog = 1 - (endAt - now) / (CONFIG.gameSeconds * 1000);
  if (now - lastSpawn > 520 - prog * 250) {
    lastSpawn = now;
    const k = pickKind();
    items.push({
      e: k.e,
      p: k.p,
      x: 30 + Math.random() * (GW - 60),
      y: -30,
      v: 2.2 + Math.random() * 1.8 + prog * 2
    });
  }

  const by = GH - 52;
  const gbox = gcv.getBoundingClientRect();
  items = items.filter(it => {
    it.y += it.v * dt;
    if (it.y > by - 22 && it.y < by + 24 && Math.abs(it.x - basketX) < 46) {
      score = Math.max(0, score + it.p);
      $('#gScore').textContent = score;
      if (it.p > 0) burst(it.x + gbox.left, it.y + gbox.top, 8);
      return false;
    }
    return it.y < GH + 40;
  });
  drawGame();
  requestAnimationFrame(gameLoop);
}

function drawGame() {
  g.clearRect(0, 0, GW, GH);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '34px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  items.forEach(it => g.fillText(it.e, it.x, it.y));
  g.font = '58px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  g.fillText('🧺', basketX, GH - 48);
}
$('#gameBtn').addEventListener('click', startGame);
drawGame();

/* ===== ШАР ПРЕДСКАЗАНИЙ ===== */
const ball = $('#ball');
const ballText = $('#ballText');
let ballBusy = false;

function askBall() {
  if (ballBusy) return;
  ballBusy = true;
  ballText.classList.add('out');
  ball.classList.remove('shake');
  void ball.offsetWidth;
  ball.classList.add('shake');
  setTimeout(() => {
    const list = CONFIG.ballAnswers;
    ballText.textContent = list[Math.floor(Math.random() * list.length)];
    ballText.classList.remove('out');
  }, 800);
  setTimeout(() => {
    ballBusy = false;
    ball.classList.remove('shake');
  }, 1150);
}
ball.addEventListener('click', askBall);
$('#ballBtn').addEventListener('click', askBall);
$('#ballQ').addEventListener('keydown', e => {
  if (e.key === 'Enter') askBall();
});

/* ===== КОНВЕРТ ===== */
const envelope = $('#envelope');
envelope.addEventListener('click', () => {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  $('#tapHint').classList.add('gone');
  const r = envelope.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + 40, 60);
  setTimeout(() => $('#letterFull').classList.add('show'), 1000);
});
$('#fireBtn').addEventListener('click', () => fireworks(14));

/* ===== НАВЕРХ ===== */
$('#toTop').addEventListener('click', () => {
  scrollTo({ top: 0, behavior: 'smooth' });
});
/* ===== ИГРА «НАЙДИ ПАРУ» ===== */
(function () {
  /* Меняем фразы под заголовком, чтобы там не было старого про скретч-карты */
  CONFIG.typed = [
    'две игры',
    'шар предсказаний',
    'письмо с секретом'
  ];

  const EMOJIS = ['🌷', '🌹', '🦋', '🧁', '☕', '🌸'];
  const grid = $('#memGrid');
  const movesEl = $('#memMoves');
  const timeEl = $('#memTime');
  const bestEl = $('#memBest');
  const msgEl = $('#memMsg');

  let first = null;
  let lock = false;
  let moves = 0;
  let pairs = 0;
  let sec = 0;
  let timer = null;
  let started = false;

  function getBest() {
    try {
      return +localStorage.getItem('elvinaMemBest') || 0;
    } catch (e) {
      return 0;
    }
  }

  function setBest(v) {
    try {
      localStorage.setItem('elvinaMemBest', v);
    } catch (e) {}
  }

  function showBest() {
    const b = getBest();
    bestEl.textContent = b ? b + ' ход.' : '—';
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function build() {
    clearInterval(timer);
    grid.innerHTML = '';
    first = null;
    lock = false;
    moves = 0;
    pairs = 0;
    sec = 0;
    started = false;
    movesEl.textContent = 0;
    timeEl.textContent = 0;
    msgEl.textContent = 'Нажми на любую карточку, чтобы начать';
    showBest();

    const deck = shuffle(EMOJIS.concat(EMOJIS));
    deck.forEach(function (emoji) {
      const b = document.createElement('button');
      b.className = 'mem-card';
      b.dataset.e = emoji;
      b.setAttribute('aria-label', 'Карточка');
      b.innerHTML =
        '<div class="mem-inner">' +
        '<div class="mem-face mem-front">✦</div>' +
        '<div class="mem-face mem-back">' + emoji + '</div>' +
        '</div>';
      b.addEventListener('click', function () { flip(b); });
      b.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
      b.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
      grid.appendChild(b);
    });
  }

  function startTimer() {
    started = true;
    timer = setInterval(function () {
      sec++;
      timeEl.textContent = sec;
    }, 1000);
  }

  function sparkle(card) {
    const r = card.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 28);
  }

  function flip(card) {
    if (lock) return;
    if (card.classList.contains('flip')) return;
    if (card.classList.contains('matched')) return;

    if (!started) startTimer();
    card.classList.add('flip');

    if (!first) {
      first = card;
      return;
    }

    const second = card;
    moves++;
    movesEl.textContent = moves;

    if (first.dataset.e === second.dataset.e) {
      first.classList.add('matched');
      second.classList.add('matched');
      sparkle(first);
      sparkle(second);
      first = null;
      pairs++;
      const left = EMOJIS.length - pairs;
      msgEl.textContent = left > 0 ? 'Пара! Осталось найти: ' + left : '';
      if (pairs === EMOJIS.length) win();
    } else {
      lock = true;
      const a = first;
      const b = second;
      first = null;
      setTimeout(function () {
        a.classList.add('wrong');
        b.classList.add('wrong');
      }, 350);
      setTimeout(function () {
        a.classList.remove('flip', 'wrong');
        b.classList.remove('flip', 'wrong');
        lock = false;
      }, 900);
    }
  }

  function win() {
    clearInterval(timer);
    const best = getBest();
    let text = 'Все пары найдены за ' + moves + ' ходов и ' + sec + ' сек! 🎉';
    if (!best || moves < best) {
      setBest(moves);
      text += ' Новый рекорд! 🏆';
    }
    msgEl.textContent = text;
    showBest();
    fireworks(7);
  }

  $('#memRestart').addEventListener('click', build);
  build();
})();
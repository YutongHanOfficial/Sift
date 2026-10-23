(() => {
  'use strict';

  const PUZZLES = window.SIFT_PUZZLES;
  const MAX_GUESSES = 6;
  const SLOTS = 5;
  const FLIP_STEP = 220; // ms between tile flips

  // Scoring: the pot starts full and only goes down — unless your stakes pay off.
  const POT = 1000;
  const TIME_CAP = 300;     // max points lost to the clock (1 pt / second)
  const GUESS_COST = 100;   // per wrong guess
  const REVEAL_COST = 120;  // see a card's true value
  const REVEAL_MAX = 2;
  const EXPOSE_COST = 200;  // expose a decoy
  const STAKE = 150;        // + if staked tile is green, − if it's a decoy
  const BONUS_MAX = 300;

  const CATS = {
    Geography: '🌍', Science: '🔬', History: '🏛️', Space: '🪐', Culture: '🎨',
    Sports: '🏆', Tech: '⚙️', Nature: '🌿', Food: '🌶️'
  };
  const GRADES = [
    { min: 1000, g: 'S', c: 'var(--accent)', word: 'Legendary' },
    { min: 850, g: 'A', c: 'var(--green)', word: 'Brilliant' },
    { min: 650, g: 'B', c: 'var(--green)', word: 'Sharp' },
    { min: 400, g: 'C', c: 'var(--amber)', word: 'Solid' },
    { min: 1, g: 'D', c: 'var(--amber)', word: 'Scraped through' },
    { min: 0, g: 'F', c: 'var(--miss)', word: 'Not today' }
  ];

  /* ---------- utilities ---------- */

  const $ = (s) => document.querySelector(s);
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±') + fmt(Math.abs(n));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function dayNumber(d = new Date()) {
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86400000);
  }
  function sizeClass(name) {
    const longest = Math.max(...name.split(/[\s–-]+/).map((w) => w.length));
    return name.length > 18 || longest > 10 ? 'xs' : name.length > 11 || longest > 8 ? 's' : '';
  }

  // A fixed shuffle of the bank so consecutive days hop between categories.
  const DAILY_ORDER = shuffle(PUZZLES.map((_, i) => i), mulberry32(20260101));
  const dailyIndex = (day) => DAILY_ORDER[((day % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];

  /* ---------- settings & stats ---------- */

  const settings = Object.assign({ theme: 'auto', colorblind: false, carry: true }, store.get('sift-settings', {}));
  function applySettings() {
    const root = document.documentElement;
    if (settings.theme === 'auto') root.removeAttribute('data-theme'); else root.dataset.theme = settings.theme;
    if (settings.colorblind) root.dataset.cb = '1'; else root.removeAttribute('data-cb');
    store.set('sift-settings', settings);
  }

  const defaultStats = () => ({
    played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0],
    lastDay: null, lastWinDay: null, best: 0, totalScore: 0, scored: 0, bullseyes: 0
  });
  let stats = Object.assign(defaultStats(), store.get('sift-stats', {}));

  /* ---------- game model ---------- */

  let G = null;          // static puzzle definition for the current game
  let S = null;          // mutable state (persisted)
  let selectedSlot = null;
  let busy = false;      // true while tiles are flipping
  let mode = null;       // null | 'stake' | 'reveal'

  function buildGame(pIdx, seed) {
    const p = PUZZLES[pIdx];
    const items = p.items.map(([name, value, label], id) => ({ id, name, value, label }));
    const asc = p.order === 'asc';
    const sorted = items.slice().sort((a, b) => (asc ? a.value - b.value : b.value - a.value));
    const rankOf = {};
    sorted.forEach((it, r) => { rankOf[it.id] = r; });
    const answer = sorted.slice(0, SLOTS).map((it) => it.id);
    return {
      p, items, sorted, rankOf, answer,
      deck: shuffle(items.map((it) => it.id), mulberry32(seed)),
      bonusId: answer[Math.floor(mulberry32(seed ^ 0x9e3779b9)() * SLOTS)]
    };
  }

  function newState(kind, pIdx, seed, day) {
    return {
      mode: kind, pIdx, seed, day,
      guesses: [], stakes: [], current: Array(SLOTS).fill(null), stakeCur: null,
      reveals: [], hint: null, elapsed: 0, started: false,
      done: false, won: false, bonus: null, scored: false
    };
  }

  // Older saves predate scoring; fill in the new fields.
  function upgrade(st) {
    const out = Object.assign(newState(st.mode, st.pIdx, st.seed, st.day), st);
    while (out.stakes.length < out.guesses.length) out.stakes.push(null);
    return out;
  }

  function feedback(guess) {
    return guess.map((id, i) => (G.answer[i] === id ? 'g' : G.answer.includes(id) ? 'y' : 'x'));
  }

  // What the player has learned about each card, including simple deductions.
  function knowledge() {
    const K = {};
    G.items.forEach((it) => { K[it.id] = { state: 'unknown', fixed: -1, notAt: new Set() }; });
    S.guesses.forEach((g) => {
      feedback(g).forEach((f, i) => {
        const k = K[g[i]];
        if (f === 'g') { k.state = 'fixed'; k.fixed = i; }
        else if (f === 'y') { if (k.state !== 'fixed') k.state = 'in'; k.notAt.add(i); }
        else k.state = 'out';
      });
    });
    if (S.hint != null) K[S.hint].state = 'out';

    const ids = G.items.map((it) => it.id);
    const inCount = ids.filter((id) => K[id].state === 'in' || K[id].state === 'fixed').length;
    const outCount = ids.filter((id) => K[id].state === 'out').length;
    if (inCount === SLOTS) ids.forEach((id) => { if (K[id].state === 'unknown') K[id].state = 'out'; });
    if (outCount === ids.length - SLOTS) ids.forEach((id) => { if (K[id].state === 'unknown') K[id].state = 'in'; });

    const fixedAt = new Set(ids.filter((id) => K[id].fixed >= 0).map((id) => K[id].fixed));
    ids.forEach((id) => { if (K[id].state === 'in') fixedAt.forEach((p) => K[id].notAt.add(p)); });
    return K;
  }

  function stakeResult(r) {
    const pos = S.stakes[r];
    if (pos == null) return 0;
    const f = feedback(S.guesses[r])[pos];
    return f === 'g' ? STAKE : f === 'x' ? -STAKE : 0;
  }

  function score() {
    const time = Math.min(TIME_CAP, Math.floor(S.elapsed));
    const wrong = S.won ? S.guesses.length - 1 : S.guesses.length;
    const guesses = wrong * GUESS_COST;
    const intel = S.reveals.length * REVEAL_COST + (S.hint != null ? EXPOSE_COST : 0);
    const stakes = S.guesses.reduce((sum, _, r) => sum + stakeResult(r), 0);
    const pot = Math.max(0, POT - time - guesses - intel + stakes);
    const bonus = S.bonus ? S.bonus.pts : 0;
    const total = S.done && !S.won ? 0 : pot + bonus;
    return { time, guesses, intel, stakes, pot, bonus, total };
  }
  const gradeFor = (total) => GRADES.find((g) => total >= g.min);

  function save() { store.set(S.mode === 'daily' ? 'sift-daily-' + S.day : 'sift-practice', S); }

  function loadDaily() {
    const day = dayNumber();
    const pIdx = dailyIndex(day);
    const saved = store.get('sift-daily-' + day, null);
    S = saved && saved.pIdx === pIdx && saved.guesses ? upgrade(saved) : newState('daily', pIdx, 1000 + day * 7919, day);
    G = buildGame(S.pIdx, S.seed);
  }

  function loadPractice(forceNew) {
    const saved = store.get('sift-practice', null);
    if (!forceNew && saved && saved.guesses && PUZZLES[saved.pIdx]) {
      S = upgrade(saved);
    } else {
      const avoid = new Set([dailyIndex(dayNumber()), saved ? saved.pIdx : -1]);
      let pIdx;
      do { pIdx = Math.floor(Math.random() * PUZZLES.length); } while (avoid.has(pIdx) && PUZZLES.length > 2);
      S = newState('practice', pIdx, Math.floor(Math.random() * 1e9), null);
      save();
    }
    G = buildGame(S.pIdx, S.seed);
  }

  /* ---------- rendering ---------- */

  function render() {
    const p = G.p;
    mode = null;
    document.querySelectorAll('.modes button').forEach((b) => {
      const on = b.dataset.mode === S.mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    $('#puzzleNo').textContent = S.mode === 'daily' ? '#' + (S.day + 1) : 'Practice';
    $('#cat').textContent = (CATS[p.cat] || '•') + ' ' + p.cat;
    $('#ask').textContent = p.ask;
    $('#axisHi').textContent = p.hi;
    renderBoard(-1);
    renderDeck();
    renderProgress();
    renderControls();
    renderPot(false);
  }

  function renderPot(animate) {
    const sc = score();
    const shown = S.done ? sc.total : sc.pot;
    const num = $('#potNum');
    const prev = parseInt(num.dataset.v || shown, 10);
    num.dataset.v = shown;
    num.textContent = fmt(shown);
    if (animate && prev !== shown) { num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump'); }
    const ratio = Math.max(0, Math.min(1, sc.pot / POT));
    const lost = S.done && !S.won;
    const color = lost ? 'var(--miss)' : ratio > 0.7 ? 'var(--green)' : ratio > 0.4 ? 'var(--amber)' : 'var(--hot)';
    $('#potbar').style.setProperty('--pot-color', color);
    $('#potFill').style.width = (lost ? 0 : ratio * 100) + '%';
    $('#potbar').classList.toggle('done', S.done);
    let hint;
    if (S.done) {
      $('.pot-label').textContent = 'Score';
      hint = S.won ? `Grade <b>${gradeFor(sc.total).g}</b>${S.bonus ? '' : '<br>bonus round waiting'}` : 'Pot lost';
    } else {
      $('.pot-label').textContent = 'Pot';
      const clock = !S.started ? 'clock starts on your first move' : sc.time >= TIME_CAP ? 'clock maxed out' : 'draining <b>−1</b>/sec';
      hint = `${clock}<br>wrong guess <b>−${GUESS_COST}</b>`;
    }
    $('#potHint').innerHTML = hint;
  }

  function renderBoard(revealRow) {
    const board = $('#board');
    board.innerHTML = '';
    board.classList.toggle('stake-mode', mode === 'stake');
    const K = knowledge();
    for (let r = 0; r < MAX_GUESSES; r++) {
      const row = el('div', 'row');
      const isCurrent = r === S.guesses.length && !S.done;
      if (isCurrent) row.classList.add('current');
      const fb = r < S.guesses.length ? feedback(S.guesses[r]) : null;
      for (let i = 0; i < SLOTS; i++) {
        const t = el('div', 'tile');
        t.dataset.pos = i;
        let id = null;
        let flame = false;
        if (fb) {
          id = S.guesses[r][i];
          flame = S.stakes[r] === i;
          t.classList.add('res-' + fb[i]);
          if (r === revealRow) { t.classList.add('flip'); t.style.setProperty('--d', (i * FLIP_STEP) / 1000 + 's'); }
          const word = { g: 'correct spot', y: 'belongs, wrong spot', x: 'does not belong' }[fb[i]];
          t.setAttribute('aria-label', `#${i + 1} ${G.items[id].name}: ${word}${flame ? ', staked' : ''}`);
        } else if (isCurrent) {
          id = S.current[i];
          t.tabIndex = 0;
          t.setAttribute('role', 'button');
          t.classList.add('slot');
          if (id != null) {
            t.classList.add('filled');
            t.dataset.drag = 'slot';
            if (S.carried && S.carried[i] === id) t.classList.add('carried');
            if (K[id].fixed === i) t.classList.add('nostake');
            flame = S.stakeCur === i;
            if (flame) t.classList.add('staked');
            t.setAttribute('aria-label', `Slot ${i + 1}: ${G.items[id].name}${flame ? ', staked' : ''}. Press to remove.`);
          } else {
            t.setAttribute('aria-label', `Slot ${i + 1}: empty`);
          }
          if (selectedSlot === i) t.classList.add('sel');
        }
        if (id != null) {
          const name = G.items[id].name;
          t.innerHTML = (flame ? '<span class="flame" aria-hidden="true">🔥</span>' : '') +
            `<span class="tname ${sizeClass(name)}">${esc(name)}</span>`;
        } else if (isCurrent) {
          t.innerHTML = `<span class="ghostnum">${i + 1}</span>`;
        }
        row.appendChild(t);
      }
      board.appendChild(row);
    }
    fitText();
  }

  function renderDeck() {
    const K = knowledge();
    const deck = $('#deck');
    deck.innerHTML = '';
    deck.classList.toggle('reveal-mode', mode === 'reveal');
    G.deck.forEach((id, idx) => {
      const it = G.items[id];
      const k = K[id];
      const c = el('button', 'card');
      c.dataset.id = id;
      let html = '';
      if (S.done) {
        const rank = G.rankOf[id];
        c.classList.add('final', rank < SLOTS ? 'final-top' : 'final-decoy');
        html += `<span class="cname ${sizeClass(it.name)}">${esc(it.name)}</span>`;
        html += `<span class="cfoot"><span class="cval">${esc(it.label)}</span><span class="rankbadge">${rank < SLOTS ? '#' + (rank + 1) : '✕'}</span></span>`;
        c.setAttribute('aria-label', `${it.name}: ${it.label}${rank < SLOTS ? ', rank ' + (rank + 1) : ', decoy'}`);
      } else {
        const usedAt = S.current.indexOf(id);
        const revealed = S.reveals.includes(id);
        c.classList.add('st-' + k.state);
        if (usedAt >= 0) c.classList.add('used');
        if (mode === 'reveal' && !revealed) c.classList.add('pickable');
        c.dataset.drag = 'deck';
        if (usedAt < 0) html += `<span class="key">${idx + 1}</span>`;
        html += `<span class="cname ${sizeClass(it.name)}">${esc(it.name)}</span>`;
        if (revealed) html += `<span class="cintel">👁 ${esc(it.label)}</span>`;
        html += '<span class="cfoot"><span class="pips">';
        for (let p = 0; p < SLOTS; p++) {
          let cls = '';
          if (k.state === 'out') cls = 'x';
          else if (k.fixed === p) cls = 'g';
          else if (k.fixed >= 0 || k.notAt.has(p)) cls = 'x';
          else if (k.state === 'in') cls = 'y';
          html += `<i class="${cls}"></i>`;
        }
        html += '</span>';
        if (usedAt >= 0) html += `<span class="usedtag">#${usedAt + 1}</span>`;
        html += '</span>';
        const stateWord = { unknown: 'unknown', in: 'belongs', fixed: 'locked at #' + (k.fixed + 1), out: 'decoy' }[k.state];
        c.setAttribute('aria-label', `${idx + 1}. ${it.name}, ${stateWord}${revealed ? ', value ' + it.label : ''}${usedAt >= 0 ? ', placed at #' + (usedAt + 1) : ''}`);
      }
      c.innerHTML = html;
      deck.appendChild(c);
    });
    fitText();
  }

  function renderProgress() {
    const K = knowledge();
    const vals = Object.values(K);
    const locked = vals.filter((k) => k.state === 'fixed').length;
    const inn = vals.filter((k) => k.state === 'in').length;
    const out = vals.filter((k) => k.state === 'out').length;
    const left = MAX_GUESSES - S.guesses.length;
    $('#progress').innerHTML = S.done
      ? `<span>${S.won ? 'Solved in <b>' + S.guesses.length + '/' + MAX_GUESSES + '</b>' : 'Out of guesses'}</span>`
      : `<span><i class="dot" style="background:var(--green)"></i><b>${locked}</b> locked</span>` +
        `<span><i class="dot" style="background:var(--amber)"></i><b>${inn}</b> belong</span>` +
        `<span><i class="dot" style="background:var(--miss)"></i><b>${out}/3</b> decoys</span>` +
        `<span><b>${left}</b> ${left === 1 ? 'guess' : 'guesses'} left</span>`;
  }

  function renderControls() {
    $('#actions').hidden = S.done;
    $('#doneActions').hidden = !S.done;
    const stakeBtn = $('#btnStake');
    stakeBtn.classList.toggle('armed', mode === 'stake');
    stakeBtn.classList.toggle('set', S.stakeCur != null && mode !== 'stake');
    stakeBtn.querySelector('.pw-name').textContent = mode === 'stake' ? 'Pick tile' : S.stakeCur != null ? 'Staked #' + (S.stakeCur + 1) : 'Stake';
    stakeBtn.querySelector('.pw-cost').textContent = S.stakeCur != null && mode !== 'stake' ? 'tap to undo' : '±' + STAKE;
    const revealBtn = $('#btnReveal');
    const revealsLeft = REVEAL_MAX - S.reveals.length;
    revealBtn.disabled = revealsLeft <= 0 || S.done;
    revealBtn.classList.toggle('armed', mode === 'reveal');
    revealBtn.querySelector('.pw-name').textContent = mode === 'reveal' ? 'Pick card' : `Reveal ×${revealsLeft}`;
    revealBtn.querySelector('.pw-cost').textContent = revealsLeft <= 0 ? 'used up' : '−' + REVEAL_COST;
    const hintBtn = $('#btnHint');
    hintBtn.disabled = S.hint != null || S.done;
    hintBtn.querySelector('.pw-cost').textContent = S.hint != null ? 'used' : '−' + EXPOSE_COST;
    $('#btnSubmit').disabled = S.current.some((x) => x == null);
    $('#btnClear').disabled = S.current.every((x) => x == null);
    $('#btnNext').textContent = S.mode === 'daily' ? 'Play practice' : 'Next puzzle';
    $('#btnResults').textContent = S.won && !S.bonus && G.p.est ? '🎯 Bonus round' : 'See results';
  }

  function refreshPlay() { renderBoard(-1); renderDeck(); renderControls(); }

  // Shrink names until no word overflows its tile or card.
  let fitQueued = false;
  function fitText() {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(() => {
      fitQueued = false;
      document.querySelectorAll('.tname, .cname').forEach((n) => {
        n.style.fontSize = '';
        let size = parseFloat(getComputedStyle(n).fontSize);
        while (size > 8 && (n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 3)) {
          size -= 0.5;
          n.style.fontSize = size + 'px';
        }
      });
    });
  }

  function floater(target, text, cls) {
    if (!target) return;
    const r = target.getBoundingClientRect();
    const f = el('div', 'floater ' + (cls || ''));
    f.textContent = text;
    f.style.left = Math.min(innerWidth - 60, Math.max(60, r.left + r.width / 2)) + 'px';
    f.style.top = r.top + r.height / 2 + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1400);
  }

  /* ---------- actions ---------- */

  function touch() {
    if (!S.started) { S.started = true; renderPot(false); }
  }

  function placeCard(id) {
    if (S.done || busy) return;
    touch();
    const at = S.current.indexOf(id);
    if (at >= 0) {
      if (selectedSlot != null && selectedSlot !== at) {
        // Move the card into the selected slot, swapping whatever was there.
        [S.current[at], S.current[selectedSlot]] = [S.current[selectedSlot], S.current[at]];
        if (S.stakeCur === at) S.stakeCur = selectedSlot; else if (S.stakeCur === selectedSlot) S.stakeCur = at;
        selectedSlot = null;
      } else {
        S.current[at] = null;
        if (S.stakeCur === at) S.stakeCur = null;
      }
    } else {
      const target = selectedSlot != null ? selectedSlot : S.current.indexOf(null);
      if (target < 0) { toast('Row is full — tap a tile to clear it'); return; }
      S.current[target] = id;
      if (S.stakeCur === target) S.stakeCur = null;
      selectedSlot = null;
    }
    save();
    refreshPlay();
  }

  function tapSlot(pos) {
    if (S.done || busy) return;
    touch();
    if (mode === 'stake') { setStake(pos); return; }
    if (S.current[pos] != null) {
      S.current[pos] = null;
      if (S.stakeCur === pos) S.stakeCur = null;
      selectedSlot = pos;
    } else {
      selectedSlot = selectedSlot === pos ? null : pos;
    }
    save();
    refreshPlay();
  }

  function moveToSlot(source, pos) {
    if (S.done || busy) return;
    touch();
    if (source.type === 'deck') {
      const at = S.current.indexOf(source.id);
      const displaced = S.current[pos];
      S.current[pos] = source.id;
      if (at >= 0 && at !== pos) S.current[at] = displaced;
      if (S.stakeCur === pos) S.stakeCur = null;
    } else if (source.pos !== pos) {
      [S.current[source.pos], S.current[pos]] = [S.current[pos], S.current[source.pos]];
      if (S.stakeCur === source.pos) S.stakeCur = pos; else if (S.stakeCur === pos) S.stakeCur = source.pos;
    }
    selectedSlot = null;
    save();
    refreshPlay();
  }

  function removeFromSlot(pos) {
    S.current[pos] = null;
    if (S.stakeCur === pos) S.stakeCur = null;
    save();
    refreshPlay();
  }

  function clearRow() {
    if (S.done || busy) return;
    S.current = Array(SLOTS).fill(null);
    S.stakeCur = null;
    selectedSlot = null;
    mode = null;
    save();
    refreshPlay();
  }

  function backspace() {
    if (S.done || busy) return;
    for (let i = SLOTS - 1; i >= 0; i--) {
      if (S.current[i] != null) { removeFromSlot(i); return; }
    }
  }

  function toggleStake() {
    if (S.done || busy) return;
    touch();
    if (mode === 'stake') { mode = null; refreshPlay(); return; }
    if (S.stakeCur != null) { S.stakeCur = null; save(); refreshPlay(); toast('Stake removed'); return; }
    const K = knowledge();
    const stakeable = S.current.some((id, i) => id != null && K[id].fixed !== i);
    if (!stakeable) { toast('Place a card you’re not sure of first'); return; }
    mode = 'stake';
    toast(`Tap a tile to bet on it: +${STAKE} if green, −${STAKE} if it’s a decoy`);
    refreshPlay();
  }

  function setStake(pos) {
    const id = S.current[pos];
    mode = null;
    if (id == null) { refreshPlay(); return; }
    if (knowledge()[id].fixed === pos) { toast('That one’s already locked — no free money!'); refreshPlay(); return; }
    S.stakeCur = pos;
    save();
    refreshPlay();
    floater($(`#board .row.current .tile[data-pos="${pos}"]`), '🔥', 'big');
  }

  function toggleReveal() {
    if (S.done || busy || S.reveals.length >= REVEAL_MAX) return;
    touch();
    mode = mode === 'reveal' ? null : 'reveal';
    if (mode) toast(`Tap a card to see its value (−${REVEAL_COST})`);
    refreshPlay();
  }

  function revealCard(id) {
    mode = null;
    if (S.reveals.includes(id)) { toast('Already revealed'); refreshPlay(); return; }
    S.reveals.push(id);
    save();
    refreshPlay();
    renderPot(true);
    floater($('#potNum'), '−' + REVEAL_COST, 'minus');
  }

  function useHint() {
    if (S.done || busy || S.hint != null) return;
    touch();
    mode = null;
    const K = knowledge();
    const candidates = G.items.map((it) => it.id).filter((id) => !G.answer.includes(id) && K[id].state !== 'out');
    if (!candidates.length) { toast('You’ve already found every decoy'); return; }
    S.hint = candidates[Math.floor(mulberry32(S.seed + S.guesses.length)() * candidates.length)];
    const at = S.current.indexOf(S.hint);
    if (at >= 0) { S.current[at] = null; if (S.stakeCur === at) S.stakeCur = null; }
    save();
    toast(`Exposed: ${G.items[S.hint].name} is a decoy`);
    refreshPlay();
    renderProgress();
    renderPot(true);
    floater($('#potNum'), '−' + EXPOSE_COST, 'minus');
  }

  function submit() {
    if (S.done || busy) return;
    mode = null;
    if (S.current.some((x) => x == null)) {
      const row = $('#board .row.current');
      if (row) { row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); }
      toast('Fill all 5 slots first');
      refreshPlay();
      return;
    }
    const guess = S.current.slice();
    if (S.guesses.some((g) => g.every((id, i) => id === guess[i]))) { toast('You already tried that exact order'); return; }

    S.guesses.push(guess);
    S.stakes.push(S.stakeCur);
    const row = S.guesses.length - 1;
    const fb = feedback(guess);
    S.won = fb.every((f) => f === 'g');
    S.done = S.won || S.guesses.length >= MAX_GUESSES;
    selectedSlot = null;
    S.carried = null;
    S.stakeCur = null;
    S.current = Array(SLOTS).fill(null);
    if (!S.done && settings.carry) {
      fb.forEach((f, i) => { if (f === 'g') S.current[i] = guess[i]; });
      S.carried = S.current.slice();
    }
    if (S.done) recordResult();
    save();

    busy = true;
    renderBoard(row);
    renderControls();
    $('#btnSubmit').disabled = true;
    const stakePos = S.stakes[row];
    if (stakePos != null) {
      setTimeout(() => {
        const v = stakeResult(row);
        floater($('#board').children[row].children[stakePos],
          v > 0 ? `🔥 +${STAKE}` : v < 0 ? `🔥 −${STAKE}` : '🔥 ±0', v > 0 ? 'plus big' : v < 0 ? 'minus big' : '');
      }, FLIP_STEP * stakePos + 300);
    }
    const total = FLIP_STEP * (SLOTS - 1) + 520;
    setTimeout(() => {
      busy = false;
      renderDeck();
      renderProgress();
      renderControls();
      renderPot(true);
      if (!S.won) floater($('#potNum'), S.done ? 'Pot lost' : '−' + GUESS_COST, 'minus');
      if (S.done) {
        if (S.won) {
          const r = $('#board').children[row];
          r.classList.add('win');
          [...r.children].forEach((t, i) => { t.classList.remove('flip'); t.style.setProperty('--d', i * 0.08 + 's'); });
          confetti();
        }
        setTimeout(S.won && G.p.est ? showBonus : finishAndShow, S.won ? 1000 : 600);
      } else {
        const n = fb.filter((f) => f === 'g').length;
        if (n === 4) toast('So close — one swap away?');
      }
    }, total);
  }

  function recordResult() {
    if (S.mode !== 'daily' || stats.lastDay === S.day) return;
    stats.played++;
    if (S.won) {
      stats.wins++;
      stats.dist[S.guesses.length - 1]++;
      stats.streak = stats.lastWinDay === S.day - 1 ? stats.streak + 1 : 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
      stats.lastWinDay = S.day;
    } else {
      stats.streak = 0;
    }
    stats.lastDay = S.day;
    store.set('sift-stats', stats);
  }

  // Lock the final score into stats once the bonus is resolved (or skipped).
  function recordScore() {
    if (S.scored) return;
    S.scored = true;
    save();
    if (S.mode !== 'daily') return;
    const t = score().total;
    stats.best = Math.max(stats.best, t);
    stats.totalScore += t;
    stats.scored++;
    if (S.bonus && S.bonus.pts >= BONUS_MAX * 0.95) stats.bullseyes++;
    store.set('sift-stats', stats);
  }

  function finishAndShow() {
    if (S.won && !S.bonus) S.bonus = { skipped: true, pts: 0 };
    recordScore();
    renderPot(true);
    renderControls();
    showResult();
  }

  function switchMode(next) {
    if (busy || next === S.mode) return;
    selectedSlot = null;
    if (next === 'daily') loadDaily(); else loadPractice(false);
    render();
  }

  /* ---------- the clock ---------- */

  setInterval(() => {
    if (!S || S.done || !S.started || !$('#overlay').hidden || document.visibilityState !== 'visible') return;
    if (S.elapsed >= TIME_CAP) return;
    S.elapsed++;
    save();
    renderPot(false);
  }, 1000);

  /* ---------- bonus round ---------- */

  function bonusPoints(guess, truth) {
    if (G.p.yr) {
      const tol = Math.max(25, (2026 - truth) * 0.1);
      return Math.round(BONUS_MAX * Math.max(0, 1 - Math.abs(guess - truth) / tol));
    }
    const err = Math.abs(guess - truth) / Math.abs(truth);
    return Math.round(BONUS_MAX * Math.max(0, 1 - err / 0.5));
  }

  function showBonus() {
    const it = G.items[G.bonusId];
    const p = G.p;
    openModal(`
      <span class="bonus-tag">🎯 Bonus round</span>
      <div class="bonus-q" id="modalTitle">${esc(it.name)}</div>
      <div class="bonus-unit">Estimate its ${esc(p.est)}. Land close for up to <b>+${BONUS_MAX}</b>.</div>
      <form id="bonusForm" autocomplete="off">
        <input class="bonus-input" id="bonusIn" inputmode="decimal" placeholder="Your best guess" aria-label="Your estimate">
        <div class="bonus-scale"><span>${p.yr ? 'The closer the year, the more you score' : 'Anything within 50% scores · within 2.5% is a bullseye'}</span></div>
        <div class="modal-actions">
          <button type="button" class="btn ghost" data-act="skip">Skip</button>
          <button type="submit" class="btn primary">Lock it in</button>
        </div>
      </form>
    `, (body) => {
      const input = body.querySelector('#bonusIn');
      setTimeout(() => input.focus(), 50);
      body.querySelector('[data-act="skip"]').onclick = () => { S.bonus = { skipped: true, pts: 0 }; finishAndShow(); };
      body.querySelector('#bonusForm').onsubmit = (e) => {
        e.preventDefault();
        const guess = parseFloat(input.value.replace(/[,\s]/g, '').replace('−', '-'));
        if (!isFinite(guess)) { input.focus(); toast('Enter a number'); return; }
        const pts = bonusPoints(guess, it.value);
        S.bonus = { guess, pts };
        save();
        showBonusResult(it, guess, pts);
      };
    });
  }

  function showBonusResult(it, guess, pts) {
    const closeness = pts / BONUS_MAX;
    const word = closeness >= 0.95 ? 'Bullseye!' : closeness >= 0.7 ? 'Very close' : closeness >= 0.35 ? 'In the ballpark' : closeness > 0 ? 'A bit off' : 'Way off';
    const shownGuess = G.p.yr && guess < 0 ? fmt(-guess) + ' BC' : guess.toLocaleString('en-US', { maximumFractionDigits: 6 });
    openModal(`
      <span class="bonus-tag">🎯 Bonus round</span>
      <div class="bonus-q" id="modalTitle">${word}</div>
      <div class="meter" aria-hidden="true"><i style="left:${Math.max(3, closeness * 100)}%"></i></div>
      <div class="bonus-scale"><span>Way off</span><span>Bullseye</span></div>
      <div class="bonus-res">
        <div><span>You said</span><b>${esc(shownGuess)}</b></div>
        <div><span>Actual</span><b>${esc(it.label)}</b></div>
      </div>
      <div class="bonus-pts">+${pts}<small>bonus points</small></div>
      <div class="modal-actions" style="grid-template-columns:1fr"><button class="btn primary" data-act="go">See my score</button></div>
    `, (body) => {
      body.querySelector('[data-act="go"]').onclick = finishAndShow;
      if (closeness >= 0.95) confetti();
    });
  }

  /* ---------- share ---------- */

  function shareText() {
    const sq = settings.colorblind ? { g: '🟧', y: '🟦', x: '⬛' } : { g: '🟩', y: '🟨', x: '⬛' };
    const sc = score();
    const head = S.mode === 'daily' ? `SIFT #${S.day + 1}` : 'SIFT Practice';
    const res = S.won ? `${S.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    const grid = S.guesses.map((g, r) => {
      const line = feedback(g).map((f) => sq[f]).join('');
      const v = stakeResult(r);
      return S.stakes[r] == null ? line : line + (v > 0 ? ' 🔥✓' : v < 0 ? ' 🔥✗' : ' 🔥');
    }).join('\n');
    const extras = [];
    if (S.bonus && !S.bonus.skipped) extras.push(`🎯 +${S.bonus.pts}`);
    if (S.reveals.length) extras.push('👁'.repeat(S.reveals.length));
    if (S.hint != null) extras.push('✦');
    const url = location.href.split('#')[0].split('?')[0];
    return `${head} · ${res} · ${fmt(sc.total)} pts (${gradeFor(sc.total).g})\n${CATS[G.p.cat] || ''} ${G.p.title}\n${grid}` +
      (extras.length ? '\n' + extras.join(' ') : '') + `\n${url}`;
  }

  async function share() {
    const text = shareText();
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ text }); return; }
    } catch (e) { /* fall back to clipboard */ }
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied results to clipboard');
    } catch (e) {
      const ta = el('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied results to clipboard'); } catch (e2) { toast('Couldn’t copy — select and copy manually'); }
      ta.remove();
    }
  }

  /* ---------- modals ---------- */

  let countdownTimer = null;
  function openModal(html, onOpen) {
    $('#modalBody').innerHTML = html;
    $('#overlay').hidden = false;
    if (onOpen) onOpen($('#modalBody'));
    if (!$('#modalBody').querySelector('input')) $('#modalClose').focus();
  }
  function closeModal() {
    $('#overlay').hidden = true;
    clearInterval(countdownTimer);
  }

  function miniGrid() {
    return '<div class="mini" aria-hidden="true">' + S.guesses.map((g) =>
      '<div>' + feedback(g).map((f) => `<i class="${f}"></i>`).join('') + '</div>').join('') + '</div>';
  }

  function showResult() {
    if (S.won && !S.bonus && G.p.est) { showBonus(); return; }
    if (!S.scored) { finishAndShow(); return; }
    const p = G.p;
    const sc = score();
    const gr = gradeFor(sc.total);
    const useBar = p.bar !== false && p.order !== 'asc';
    const max = Math.max(...G.items.map((it) => it.value));
    let list = '';
    G.sorted.forEach((it, r) => {
      if (r === SLOTS) list += '<li class="cut">Decoys</li>';
      const bar = useBar ? `<span class="barfill" style="width:${Math.max(2, (it.value / max) * 100)}%;animation-delay:${r * 60}ms"></span>` : '';
      list += `<li class="${r < SLOTS ? 'top' : 'decoy'}">${bar}<span class="rk">${r < SLOTS ? r + 1 : '–'}</span><span class="nm">${esc(it.name)}</span><span class="vl">${esc(it.label)}</span></li>`;
    });
    const line = (label, v) => `<li><span>${label}</span><span class="${v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero'}">${signed(v)}</span></li>`;
    const breakdown = S.won
      ? `<ul class="breakdown">
          <li><span>Starting pot</span><span>${fmt(POT)}</span></li>
          ${line('Clock', -sc.time)}
          ${line(`Wrong guesses (${S.guesses.length - 1})`, -sc.guesses)}
          ${line('Reveals &amp; exposes', -sc.intel)}
          ${line(`Stakes (${S.stakes.filter((x) => x != null).length})`, sc.stakes)}
          ${line('Bonus round', sc.bonus)}
          <li><span>Final score</span><span>${fmt(sc.total)}</span></li>
        </ul>`
      : '<p class="muted" style="text-align:center">Six guesses used, so the pot is lost. The answer is below.</p>';
    openModal(`
      <div class="result-head">
        <div class="chip">${CATS[p.cat] || ''} ${esc(p.title)}</div>
        <div class="grade" style="--grade-c:${gr.c}">${gr.g}</div>
        <div class="total" id="modalTitle">${fmt(sc.total)} pts</div>
        <div class="meta">${gr.word}${S.won ? ` · solved in ${S.guesses.length}/${MAX_GUESSES}` : ''}</div>
      </div>
      ${miniGrid()}
      <h3>Score</h3>
      ${breakdown}
      <h3>The ranking · ${esc(p.hi.toLowerCase())} first</h3>
      <ol class="ranking">${list}</ol>
      <div class="fact"><b>Did you know?</b> ${esc(p.fact)}${p.src ? `<div class="src">Source: ${esc(p.src)}</div>` : ''}</div>
      <div class="modal-actions">
        <button class="btn primary" data-act="share">Share</button>
        <button class="btn ghost" data-act="next">${S.mode === 'daily' ? 'Practice mode' : 'Next puzzle'}</button>
      </div>
      ${S.mode === 'daily' ? '<div class="next-in">Next daily puzzle in <b id="countdown">--:--:--</b></div>' : ''}
    `, (body) => {
      body.querySelector('[data-act="share"]').onclick = share;
      body.querySelector('[data-act="next"]').onclick = () => { closeModal(); nextAction(); };
      if (S.mode === 'daily') startCountdown();
    });
  }

  function startCountdown() {
    const tick = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((next - now) / 1000));
      const t = $('#countdown');
      if (!t) return;
      t.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
      if (s === 0 && S.mode === 'daily') { closeModal(); loadDaily(); render(); }
    };
    tick();
    clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 1000);
  }

  function nextAction() {
    selectedSlot = null;
    loadPractice(S.mode !== 'daily');
    render();
  }

  function showHelp() {
    const t = (name, cls, flame) => `<div class="tile res-${cls}">${flame ? '<span class="flame">🔥</span>' : ''}<span class="tname s">${name}</span></div>`;
    openModal(`
      <h2 id="modalTitle">How to play</h2>
      <p class="muted">Eight cards. Five belong. One right order. Every second costs you.</p>
      <ol class="rules">
        <li>Each puzzle asks for a top 5: the <b>longest</b>, <b>oldest</b>, <b>hottest</b>… Of the 8 cards, <b>3 are decoys</b>.</li>
        <li>Fill the row ranked from <b>#1 on the left</b> and submit. You have <b>6 guesses</b>.</li>
      </ol>
      <h3>Example · Tallest mountains</h3>
      <div class="example">${t('Everest', 'g', true)}${t('Lhotse', 'y')}${t('Cho Oyu', 'x')}${t('K2', 'y')}${t('Makalu', 'g')}</div>
      <div class="legend">
        <div><span class="sw g"></span><span><b>Everest</b> and <b>Makalu</b> are in exactly the right spots. Everest was staked 🔥, so it paid <b>+${STAKE}</b>.</span></div>
        <div><span class="sw y"></span><span><b>Lhotse</b> and <b>K2</b> are in the top 5, but in the wrong spots.</span></div>
        <div><span class="sw x"></span><span><b>Cho Oyu</b> is a decoy, not in the top 5.</span></div>
      </div>
      <h3>The pot only goes down</h3>
      <p class="muted">You start with <b>${fmt(POT)}</b> points. Once you make your first move, the clock drains <b>1 per second</b> (up to ${TIME_CAP}), and every wrong guess costs <b>${GUESS_COST}</b>. Solve it to bank what’s left. Run out of guesses and you lose it all.</p>
      <h3>Power-ups</h3>
      <div class="legend">
        <div><span aria-hidden="true">🔥</span><span><b>Stake</b>: bet on one tile per guess. Green pays <b>+${STAKE}</b>, a decoy costs <b>−${STAKE}</b>, yellow is a push. It’s the only way to grow the pot.</span></div>
        <div><span aria-hidden="true">👁</span><span><b>Reveal</b>: see a card’s true value for <b>−${REVEAL_COST}</b>. Twice per game.</span></div>
        <div><span aria-hidden="true">✦</span><span><b>Expose</b>: unmask one decoy for <b>−${EXPOSE_COST}</b>. Once per game.</span></div>
      </div>
      <h3>🎯 Bonus round</h3>
      <p class="muted">Solve it, then estimate the real value of one of your cards. Land close for up to <b>+${BONUS_MAX}</b>. Scores of ${fmt(1000)}+ earn an <b>S</b>.</p>
      <h3>Reading the cards</h3>
      <p class="muted">The five bars under each card show the ranks it could still hold. Ruled-out ranks are crossed off.</p>
      <h3>Controls</h3>
      <p class="muted">Tap cards to place them, or drag them into any slot. Tap a placed tile to clear it. Keyboard: <b>1–8</b> place, <b>Backspace</b> remove, <b>S</b> stake, <b>Enter</b> submit.</p>
      <div class="modal-actions" style="grid-template-columns:1fr"><button class="btn primary" data-act="go">Let’s play</button></div>
    `, (body) => { body.querySelector('[data-act="go"]').onclick = closeModal; });
  }

  function showStats() {
    const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
    const avg = stats.scored ? Math.round(stats.totalScore / stats.scored) : 0;
    const maxD = Math.max(1, ...stats.dist);
    const hl = S.mode === 'daily' && S.done && S.won ? S.guesses.length - 1 : -1;
    const dist = stats.dist.map((n, i) =>
      `<div><span>${i + 1}</span><span class="bar${i === hl ? ' hl' : ''}" style="width:${Math.max(8, (n / maxD) * 100)}%">${n}</span></div>`).join('');
    openModal(`
      <h2 id="modalTitle">Statistics</h2>
      <p class="muted">Daily puzzles only.</p>
      <div class="stats-grid">
        <div><b>${stats.played}</b><span>Played</span></div>
        <div><b>${winPct}</b><span>Win %</span></div>
        <div><b>${stats.streak}</b><span>Streak</span></div>
        <div><b>${stats.maxStreak}</b><span>Best streak</span></div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div><b>${fmt(stats.best)}</b><span>Best score</span></div>
        <div><b>${fmt(avg)}</b><span>Avg score</span></div>
        <div><b>${stats.bullseyes}</b><span>Bullseyes 🎯</span></div>
      </div>
      <h3>Guess distribution</h3>
      <div class="dist">${dist}</div>
      ${S.mode === 'daily' && S.done && S.scored ? '<div class="modal-actions" style="grid-template-columns:1fr"><button class="btn primary" data-act="share">Share today</button></div>' : ''}
    `, (body) => {
      const b = body.querySelector('[data-act="share"]');
      if (b) b.onclick = share;
    });
  }

  function showSettings() {
    const seg = ['auto', 'light', 'dark'].map((t) =>
      `<button data-theme="${t}" class="${settings.theme === t ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('');
    openModal(`
      <h2 id="modalTitle">Settings</h2>
      <div class="setting"><div>Theme</div><div class="seg" id="themeSeg">${seg}</div></div>
      <label class="setting"><div>High-contrast colours<small>Orange and blue instead of green and yellow</small></div>
        <span class="switch"><input type="checkbox" id="optCb" ${settings.colorblind ? 'checked' : ''}><span></span></span></label>
      <label class="setting"><div>Keep locked cards<small>Green cards carry into your next row</small></div>
        <span class="switch"><input type="checkbox" id="optCarry" ${settings.carry ? 'checked' : ''}><span></span></span></label>
      <div class="setting"><div>Puzzle bank<small>${PUZZLES.length} puzzles across ${new Set(PUZZLES.map((p) => p.cat)).size} categories</small></div></div>
    `, (body) => {
      body.querySelectorAll('#themeSeg button').forEach((b) => {
        b.onclick = () => {
          settings.theme = b.dataset.theme; applySettings();
          body.querySelectorAll('#themeSeg button').forEach((x) => x.classList.toggle('on', x === b));
        };
      });
      body.querySelector('#optCb').onchange = (e) => { settings.colorblind = e.target.checked; applySettings(); };
      body.querySelector('#optCarry').onchange = (e) => { settings.carry = e.target.checked; applySettings(); };
    });
  }

  /* ---------- toast & confetti ---------- */

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const colors = [css.getPropertyValue('--green'), css.getPropertyValue('--amber'), css.getPropertyValue('--accent'), '#ffffff'];
    const parts = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    const start = performance.now();
    (function frame(now) {
      const t = now - start;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 2600);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t < 2600) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(start);
  }

  /* ---------- pointer: tap and drag ---------- */

  let drag = null;
  let suppressClick = false;

  function dragSource(target) {
    const card = target.closest('.card[data-drag]');
    if (card) return { type: 'deck', id: +card.dataset.id, node: card };
    const tile = target.closest('.row.current .tile[data-drag]');
    if (tile) return { type: 'slot', pos: +tile.dataset.pos, id: S.current[+tile.dataset.pos], node: tile };
    return null;
  }

  function slotAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    return hit ? hit.closest('.row.current .tile') : null;
  }

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || S.done || busy || mode) return;
    const src = dragSource(e.target);
    if (!src) return;
    drag = { src, x0: e.clientX, y0: e.clientY, active: false, ghost: null, over: null };
  });

  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
      drag.active = true;
      const g = drag.src.node.cloneNode(true);
      const r = drag.src.node.getBoundingClientRect();
      g.classList.add('drag-ghost');
      g.style.width = r.width + 'px';
      g.style.height = r.height + 'px';
      document.body.appendChild(g);
      drag.ghost = g;
    }
    drag.ghost.style.left = e.clientX + 'px';
    drag.ghost.style.top = e.clientY + 'px';
    const over = slotAt(e.clientX, e.clientY);
    if (over !== drag.over) {
      if (drag.over) drag.over.classList.remove('drop');
      if (over) over.classList.add('drop');
      drag.over = over;
    }
  });

  function endDrag(e, cancelled) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    d.ghost.remove();
    if (d.over) d.over.classList.remove('drop');
    if (cancelled) return;
    const over = slotAt(e.clientX, e.clientY);
    if (over) moveToSlot(d.src, +over.dataset.pos);
    else if (d.src.type === 'slot') removeFromSlot(d.src.pos);
  }
  document.addEventListener('pointerup', (e) => endDrag(e, false));
  document.addEventListener('pointercancel', (e) => endDrag(e, true));

  document.addEventListener('click', (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    const card = e.target.closest('#deck .card');
    if (card && !S.done) {
      if (mode === 'reveal') revealCard(+card.dataset.id);
      else if (mode === 'stake') { mode = null; refreshPlay(); }
      else placeCard(+card.dataset.id);
      return;
    }
    const tile = e.target.closest('.row.current .tile');
    if (tile) tapSlot(+tile.dataset.pos);
  }, true);

  /* ---------- keyboard ---------- */

  document.addEventListener('keydown', (e) => {
    if (!$('#overlay').hidden) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const focusedTile = document.activeElement && document.activeElement.closest && document.activeElement.closest('.row.current .tile');
    if (mode === 'stake' && /^[1-5]$/.test(e.key)) {
      setStake(+e.key - 1);
      e.preventDefault();
    } else if (/^[1-8]$/.test(e.key)) {
      const id = G.deck[+e.key - 1];
      if (mode === 'reveal') revealCard(id); else placeCard(id);
      e.preventDefault();
    } else if (e.key === 'Escape' && mode) {
      mode = null; refreshPlay();
    } else if (e.key === 's' || e.key === 'S') {
      toggleStake();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      backspace();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (focusedTile) { tapSlot(+focusedTile.dataset.pos); e.preventDefault(); return; }
      const a = document.activeElement;
      if (a && a.tagName === 'BUTTON' && !a.classList.contains('card')) return;
      submit();
      e.preventDefault();
    } else if (e.key === ' ' && focusedTile) {
      tapSlot(+focusedTile.dataset.pos);
      e.preventDefault();
    }
  });

  /* ---------- wiring ---------- */

  $('#btnSubmit').onclick = submit;
  $('#btnClear').onclick = clearRow;
  $('#btnStake').onclick = toggleStake;
  $('#btnReveal').onclick = toggleReveal;
  $('#btnHint').onclick = useHint;
  $('#btnResults').onclick = showResult;
  $('#btnNext').onclick = nextAction;
  $('#btnHelp').onclick = showHelp;
  $('#linkHelp').onclick = (e) => { e.preventDefault(); showHelp(); };
  $('#btnStats').onclick = showStats;
  $('#btnSettings').onclick = showSettings;
  $('#modalClose').onclick = closeModal;
  $('#overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
  document.querySelectorAll('.modes button').forEach((b) => { b.onclick = () => switchMode(b.dataset.mode); });

  // Roll over to the new daily puzzle if the tab was left open past midnight.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && S.mode === 'daily' && S.day !== dayNumber() && !busy) {
      loadDaily(); render();
    }
  });
  window.addEventListener('resize', fitText);
  if (document.fonts) document.fonts.ready.then(fitText);

  applySettings();
  loadDaily();
  render();
  if (!store.get('sift-seen-v2', false)) { store.set('sift-seen-v2', true); showHelp(); }
})();

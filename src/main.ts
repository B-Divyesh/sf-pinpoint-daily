import './style.css';
import {
  BOARD,
  FIXED_STEP,
  GameSimulation,
  MAX_SHOTS,
  SimulationSnapshot,
  Vec,
  dailySeed,
  makeCourse,
  predictedPoints,
} from './game';

type RunOutcome = 'won' | 'lost' | null;
type SavedRun = {
  seed: number;
  holeIndex: number;
  shots: number;
  total: number;
  holesWon: number;
  angle: number;
  power: number;
  simulation: SimulationSnapshot;
  outcome: RunOutcome;
};
type Saved = { best: number | null; completed: string[]; sound: boolean; run?: SavedRun };

const DEMO_SEED = 20260901;
const app = document.querySelector<HTMLDivElement>('#app')!;
let demo = false;
let stopGame = () => {};

const storageKey = (isDemo: boolean) => `${isDemo ? 'demo:' : 'pinpoint:'}daily-v1`;
const emptySave = (): Saved => ({ best: null, completed: [], sound: false });
const load = (key: string): Saved => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null') as Partial<Saved> | null;
    if (!value || !Array.isArray(value.completed)) return emptySave();
    return {
      best: typeof value.best === 'number' ? value.best : null,
      completed: value.completed.filter((day): day is string => typeof day === 'string'),
      sound: value.sound === true,
      run: value.run,
    };
  } catch {
    return emptySave();
  }
};
const save = (key: string, value: Saved) => localStorage.setItem(key, JSON.stringify(value));

function link(path: string, label: string) {
  return `<a href="${path}" data-route>${label}</a>`;
}

function updateMetadata(path: string) {
  const routeName = path === '/demo' ? 'Demo' : path === '/privacy' ? 'Privacy' : path === '/terms' ? 'Terms' : path === '/' ? '' : 'Page not found';
  const title = routeName ? `${routeName} — Pinpoint Daily` : 'Pinpoint Daily — Play a daily three-hole course';
  const canonicalPath = path === '/' ? '/' : path;
  document.title = title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://pinpoint-daily.sociobot.in${canonicalPath}`;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = `https://pinpoint-daily.sociobot.in${canonicalPath}`;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = title;
}

function shell(content: string) {
  app.innerHTML = `<a class="skip" href="#main">Skip to game</a>
    <header>
      <a class="wordmark" href="/" data-route aria-label="Pinpoint Daily home"><span>PIN</span>POINT <b>DAILY</b></a>
      <nav aria-label="Main navigation">${link('/demo', 'Demo')}${link('/#how', 'How it works')}${link('/privacy', 'Privacy')}</nav>
    </header>
    <main id="main" tabindex="-1">${content}</main>
    <footer><span>Play one shared tabletop course each day.</span>${link('/privacy', 'Privacy')}${link('/terms', 'Terms')}<span>Built by Param Factory · build 1.1.0</span><span>Course art uses original generated imagery.</span></footer>
    <div class="sr-only" aria-live="polite" id="announcer"></div>`;
  wireLinks();
}

function announceRoute() {
  const heading = document.querySelector<HTMLHeadingElement>('h1');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  document.querySelector<HTMLElement>('#announcer')!.textContent = `${heading.textContent ?? ''} page loaded`;
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  else scrollTo(0, 0);
}

function policy(type: 'privacy' | 'terms') {
  stopGame();
  stopGame = () => {};
  const privacy = type === 'privacy';
  shell(`<section class="legal"><p class="eyebrow">${privacy ? 'PRIVACY' : 'TERMS'}</p>
    <h1>${privacy ? 'Your scores stay on this device' : 'Rules for playing Pinpoint Daily'}</h1>
    <p>${privacy ? 'Pinpoint Daily stores your daily best score, current run, and settings in this browser only.' : 'Pinpoint Daily is a free game for general audiences.'}</p>
    <h2>${privacy ? 'What is stored' : 'Use of the game'}</h2>
    <p>${privacy ? 'Your current run, completed dates, sound setting, and best score use local browser storage. No account is required. Game data is not sent to a server.' : 'Play fairly, do not interfere with the site, and use the game at your own discretion.'}</p>
    <h2>${privacy ? 'How to remove it' : 'Availability'}</h2>
    <p>${privacy ? 'Use “Clear local score” on the game screen, or clear this site’s browser data. Demo data has a separate storage key and is removed when you reset it.' : 'The course and its local storage are provided as-is and may change with future releases.'}</p>
    <p><a href="/" data-route>Return to today’s course</a></p></section>`);
}

function notFound() {
  stopGame();
  stopGame = () => {};
  shell(`<section class="legal not-found"><p class="eyebrow">404</p><h1>This course does not exist</h1><p>The address does not match a Pinpoint Daily page.</p><p><a class="button primary" href="/" data-route>Return to today’s course</a></p></section>`);
}

function home() {
  stopGame();
  stopGame = () => {};
  const seed = demo ? DEMO_SEED : dailySeed();
  const dateText = demo
    ? 'SAMPLE COURSE · 1 SEP 2026'
    : `TODAY’S SHARED COURSE · ${new Intl.DateTimeFormat('en-GB', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date()).toUpperCase()}`;
  const banner = demo
    ? `<div class="demo-banner" role="status"><strong>Demo — sample data, saved only here</strong><button id="reset-demo">Reset demo</button><button id="start-real">Start for real</button></div>`
    : '';
  shell(`${banner}<section class="intro"><div><p class="eyebrow">${dateText}</p><h1>Play today’s three-hole course</h1>
    <p class="lede">For players who want a short physics puzzle with the same fair course for everyone.</p>
    <div class="actions"><a class="button primary" href="/demo" data-route>Try it with sample data</a><span>Opens a practice course in separate demo storage.</span></div>
    <ul class="facts"><li>Free to play</li><li>Five shots per hole</li><li>Scores stay on this device</li></ul></div>
    <img src="/hero-blueprint.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="A tabletop golf course drawn on a navy blueprint sheet." /></section>
    <section class="play-section" aria-labelledby="course-heading"><div class="section-title"><div><p class="eyebrow">LIVE COURSE</p><h2 id="course-heading">Aim, check the dotted path, then shoot</h2></div><p>Drag away from the ball to set aim and power.</p></div><div id="game-root"></div></section>
    <section class="how" id="how"><p class="eyebrow">HOW IT WORKS</p><h2>Play the daily course in three steps</h2><ol><li><b>Read the board.</b> Wind, walls, and the moving bumper are visible.</li><li><b>Drag a shot.</b> The dotted path previews bounces before release.</li><li><b>Finish three holes.</b> Sink every cup to win. Five missed shots lose a hole.</li></ol></section>
    <section class="privacy-note"><h2>What this game does not do</h2><p>It has no accounts, ads, analytics, or public leaderboard. Game data stays in your browser.</p></section>`);
  mountGame(document.querySelector('#game-root')!, seed, demo);
  if (demo) {
    document.querySelector('#reset-demo')?.addEventListener('click', () => {
      stopGame();
      stopGame = () => {};
      localStorage.removeItem(storageKey(true));
      home();
    });
    document.querySelector('#start-real')?.addEventListener('click', () => {
      stopGame();
      stopGame = () => {};
      localStorage.removeItem(storageKey(true));
      history.pushState({}, '', '/');
      route(true);
    });
  }
}

function route(focus = false) {
  demo = location.pathname === '/demo' || (location.pathname === '/' && new URLSearchParams(location.search).get('demo') === '1');
  const path = location.pathname;
  updateMetadata(demo ? '/demo' : path);
  if (path === '/privacy') policy('privacy');
  else if (path === '/terms') policy('terms');
  else if (path === '/' || path === '/demo') home();
  else notFound();
  if (focus) queueMicrotask(announceRoute);
}

function wireLinks() {
  document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach(anchor => anchor.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState({}, '', `${anchor.pathname}${anchor.search}${anchor.hash}`);
    route(true);
  }));
}

window.addEventListener('popstate', () => route(true));

function mountGame(root: Element, seed: number, isDemo: boolean) {
  const key = storageKey(isDemo);
  const holes = makeCourse(seed);
  root.setAttribute('data-course-seed', String(seed));
  root.setAttribute('data-simulation-hz', String(Math.round(1 / FIXED_STEP)));
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = BOARD.w * ratio;
  canvas.height = BOARD.h * ratio;
  canvas.setAttribute('aria-label', 'Interactive tabletop golf course');
  canvas.tabIndex = 0;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(ratio, ratio);
  root.innerHTML = `<div class="game-wrap"><div class="score-strip"><span id="hole-label">Hole 1 of 3</span><span id="shot-label">Shots: 0 / ${MAX_SHOTS}</span><span id="win-label">Cups: 0 / 3</span><span id="wind-label"></span><button id="pause" aria-pressed="false">Pause</button></div></div>
    <div class="game-controls"><button id="left" aria-label="Aim left">← Aim</button><button id="right" aria-label="Aim right">Aim →</button><button id="less">Less power</button><button id="more">More power</button><button class="shoot" id="shoot">Shoot</button><button id="reset-hole">Reset hole</button><button id="sound" aria-pressed="false">Sound off</button></div>
    <div class="game-status" id="game-status" aria-live="polite">Drag from the ball, or use arrow keys and Enter.</div><div class="results" id="results" tabindex="-1" hidden></div><button class="clear-score" id="clear-score">Clear local score</button>`;
  root.querySelector('.game-wrap')!.append(canvas);

  let stored = load(key);
  const validRun = stored.run && stored.run.seed === seed && stored.run.holeIndex >= 0 && stored.run.holeIndex < holes.length;
  let holeIndex = validRun ? stored.run!.holeIndex : 0;
  let shots = validRun ? stored.run!.shots : 0;
  let total = validRun ? stored.run!.total : 0;
  let holesWon = validRun ? stored.run!.holesWon : 0;
  let angle = validRun ? stored.run!.angle : -.4;
  let power = validRun ? stored.run!.power : 95;
  let outcome: RunOutcome = validRun ? stored.run!.outcome : null;
  let sim = new GameSimulation(holes[holeIndex], validRun ? stored.run!.simulation : undefined);
  let paused = false;
  let pointerStart: Vec | null = null;
  let dragAim: Vec | null = null;
  let last = performance.now();
  let lastPersisted = 0;
  let accumulator = 0;
  let audioContext: AudioContext | null = null;
  let shouldPersist = Boolean(validRun);

  const status = root.querySelector<HTMLElement>('#game-status')!;
  const result = root.querySelector<HTMLElement>('#results')!;
  const holeLabel = root.querySelector<HTMLElement>('#hole-label')!;
  const shotLabel = root.querySelector<HTMLElement>('#shot-label')!;
  const winLabel = root.querySelector<HTMLElement>('#win-label')!;
  const windLabel = root.querySelector<HTMLElement>('#wind-label')!;
  const soundButton = root.querySelector<HTMLButtonElement>('#sound')!;
  const pauseButton = root.querySelector<HTMLButtonElement>('#pause')!;

  const runState = (): SavedRun => ({ seed, holeIndex, shots, total, holesWon, angle, power, simulation: sim.snapshot(), outcome });
  const persist = () => {
    stored.run = runState();
    save(key, stored);
    shouldPersist = true;
  };
  const syncLabels = () => {
    holeLabel.textContent = `Hole ${holeIndex + 1} of 3`;
    shotLabel.textContent = `Shots: ${shots} / ${MAX_SHOTS}`;
    winLabel.textContent = `Cups: ${holesWon} / 3`;
    soundButton.textContent = stored.sound ? 'Sound on' : 'Sound off';
    soundButton.setAttribute('aria-pressed', String(stored.sound));
  };
  const tone = async (frequency: number, duration = .08) => {
    if (!stored.sound) return;
    try {
      audioContext ??= new AudioContext();
      await audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.055, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      status.textContent = 'Sound could not start in this browser. The game still works without it.';
    }
  };
  const coords = (event: PointerEvent): Vec => {
    const box = canvas.getBoundingClientRect();
    return { x: (event.clientX - box.left) * BOARD.w / box.width, y: (event.clientY - box.top) * BOARD.h / box.height };
  };
  const fire = (aim: Vec) => {
    if (paused || outcome || shots >= MAX_SHOTS || !sim.shoot(aim)) return;
    shots++;
    total++;
    shotLabel.textContent = `Shots: ${shots} / ${MAX_SHOTS}`;
    status.textContent = 'Ball rolling. Watch the bounce.';
    void tone(260);
    persist();
  };

  canvas.addEventListener('pointerdown', event => {
    if (sim.moving || paused || outcome) return;
    canvas.setPointerCapture(event.pointerId);
    pointerStart = coords(event);
    dragAim = null;
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointerStart || paused) return;
    const point = coords(event);
    const candidate = { x: sim.ball.x - point.x, y: sim.ball.y - point.y };
    dragAim = Math.hypot(candidate.x, candidate.y) >= 8 ? candidate : null;
  });
  const endPointer = () => {
    if (dragAim) fire(dragAim);
    pointerStart = null;
    dragAim = null;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', () => { pointerStart = null; dragAim = null; });

  const resetHole = () => {
    if (outcome) return;
    sim.reset();
    status.textContent = 'Hole reset. Your used shots remain counted.';
    persist();
  };
  const togglePause = () => {
    if (outcome) return;
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(paused));
    status.textContent = paused ? 'Game paused.' : 'Game resumed.';
  };
  const keyboard = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
    if (event.key === 'ArrowLeft') { angle -= .12; persist(); event.preventDefault(); }
    if (event.key === 'ArrowRight') { angle += .12; persist(); event.preventDefault(); }
    if (event.key === 'ArrowUp') { power = Math.min(180, power + 10); persist(); event.preventDefault(); }
    if (event.key === 'ArrowDown') { power = Math.max(30, power - 10); persist(); event.preventDefault(); }
    if (event.key === 'Enter' || event.key === ' ') { fire({ x: Math.cos(angle) * power, y: Math.sin(angle) * power }); event.preventDefault(); }
    if (event.key.toLowerCase() === 'r') resetHole();
    if (event.key === 'Escape') togglePause();
  };
  window.addEventListener('keydown', keyboard);

  root.querySelector('#reset-hole')?.addEventListener('click', resetHole);
  pauseButton.addEventListener('click', togglePause);
  root.querySelector('#left')?.addEventListener('click', () => { if (!outcome) { angle -= .12; persist(); } });
  root.querySelector('#right')?.addEventListener('click', () => { if (!outcome) { angle += .12; persist(); } });
  root.querySelector('#less')?.addEventListener('click', () => { if (!outcome) { power = Math.max(30, power - 10); persist(); } });
  root.querySelector('#more')?.addEventListener('click', () => { if (!outcome) { power = Math.min(180, power + 10); persist(); } });
  root.querySelector('#shoot')?.addEventListener('click', () => fire({ x: Math.cos(angle) * power, y: Math.sin(angle) * power }));
  soundButton.addEventListener('click', () => {
    stored.sound = !stored.sound;
    syncLabels();
    persist();
    if (stored.sound) void tone(520, .12);
  });
  root.querySelector('#clear-score')?.addEventListener('click', () => {
    stored.best = null;
    stored.completed = [];
    persist();
    status.textContent = 'Local score cleared. Your current run remains.';
  });

  function renderResult() {
    if (!outcome) return;
    result.hidden = false;
    if (outcome === 'won') {
      result.innerHTML = `<h3>Course complete — you won</h3><p>You sank all three cups in <strong>${total} shots</strong>. ${stored.best === total ? 'That is your local best.' : `Local best: ${stored.best} shots.`}</p><button id="play-again">Play again</button>`;
    } else {
      result.innerHTML = `<h3>Course over — try again</h3><p>You sank <strong>${holesWon} of 3 cups</strong>. Sink every cup to win.</p><button id="play-again">Play again</button>`;
    }
    result.querySelector('#play-again')?.addEventListener('click', startNewRun);
  }

  function startNewRun() {
    outcome = null;
    result.hidden = true;
    holeIndex = 0;
    shots = 0;
    total = 0;
    holesWon = 0;
    angle = -.4;
    power = 95;
    sim = new GameSimulation(holes[0]);
    syncLabels();
    status.textContent = 'New run. Read the path before shooting.';
    persist();
    canvas.focus();
  }

  function finish() {
    outcome = holesWon === holes.length ? 'won' : 'lost';
    if (outcome === 'won') {
      if (stored.best === null || total < stored.best) stored.best = total;
      const day = String(seed);
      if (!stored.completed.includes(day)) stored.completed.push(day);
      void tone(820, .2);
    } else {
      void tone(145, .22);
    }
    syncLabels();
    persist();
    renderResult();
    result.focus({ preventScroll: true });
  }

  function nextHole(cup: boolean) {
    if (cup) holesWon++;
    if (holeIndex === holes.length - 1) {
      finish();
      return;
    }
    holeIndex++;
    shots = 0;
    angle = -.4;
    power = 95;
    sim = new GameSimulation(holes[holeIndex]);
    syncLabels();
    status.textContent = cup ? 'In the cup. Next hole.' : 'Five shots used. That hole was lost. Next hole.';
    void tone(cup ? 680 : 170, .12);
    persist();
  }

  function draw(alpha = 1) {
    const hole = holes[holeIndex];
    const ball = {
      x: sim.previousBall.x + (sim.ball.x - sim.previousBall.x) * alpha,
      y: sim.previousBall.y + (sim.ball.y - sim.previousBall.y) * alpha,
    };
    ctx.clearRect(0, 0, BOARD.w, BOARD.h);
    ctx.fillStyle = '#073957';
    ctx.fillRect(0, 0, BOARD.w, BOARD.h);
    ctx.strokeStyle = 'rgba(83,214,230,.16)';
    ctx.lineWidth = 1;
    for (let x = 0; x < BOARD.w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BOARD.h); ctx.stroke(); }
    for (let y = 0; y < BOARD.h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BOARD.w, y); ctx.stroke(); }
    ctx.strokeStyle = '#53d6e6';
    ctx.lineWidth = 4;
    ctx.strokeRect(7, 7, BOARD.w - 14, BOARD.h - 14);
    for (const wall of hole.walls) {
      ctx.fillStyle = '#f5edd7';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = '#0b5f92';
      ctx.fillRect(wall.x + 5, wall.y + 5, wall.w - 10, wall.h - 10);
    }
    const bumper = sim.bumperAt();
    ctx.fillStyle = '#ff715b';
    ctx.beginPath(); ctx.arc(bumper.x, bumper.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff9e9'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#f7c948'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(hole.cup.x, hole.cup.y, BOARD.cup, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f7c948'; ctx.fillRect(hole.cup.x, hole.cup.y - 45, 3, 29);
    ctx.beginPath(); ctx.moveTo(hole.cup.x + 3, hole.cup.y - 45); ctx.lineTo(hole.cup.x + 29, hole.cup.y - 36); ctx.lineTo(hole.cup.x + 3, hole.cup.y - 27); ctx.fill();
    const aim = dragAim || (!sim.moving && !outcome ? { x: Math.cos(angle) * power, y: Math.sin(angle) * power } : null);
    if (aim && !paused) {
      const points = predictedPoints(hole, sim.ball, aim);
      ctx.fillStyle = '#53d6e6';
      points.forEach((point, index) => { if (index % 2 === 0) { ctx.beginPath(); ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2); ctx.fill(); } });
      ctx.strokeStyle = 'rgba(83,214,230,.75)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sim.ball.x, sim.ball.y); ctx.lineTo(sim.ball.x + aim.x, sim.ball.y + aim.y); ctx.stroke();
    }
    ctx.fillStyle = '#fff9e9'; ctx.beginPath(); ctx.arc(ball.x, ball.y, BOARD.ball, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#062947'; ctx.lineWidth = 2; ctx.stroke();
    windLabel.textContent = hole.wind.x || hole.wind.y ? `Wind ${hole.wind.x > 0 ? '→' : '←'} light` : 'No wind';
  }

  syncLabels();
  if (validRun) status.textContent = outcome ? 'Finished run restored.' : `Run restored at hole ${holeIndex + 1}.`;
  if (outcome) renderResult();

  let active = true;
  const saveOnHide = () => { if (shouldPersist) persist(); };
  addEventListener('pagehide', saveOnHide);
  document.addEventListener('visibilitychange', saveOnHide);
  stopGame = () => {
    if (!active) return;
    if (shouldPersist) persist();
    active = false;
    window.removeEventListener('keydown', keyboard);
    removeEventListener('pagehide', saveOnHide);
    document.removeEventListener('visibilitychange', saveOnHide);
    if (audioContext) void audioContext.close();
  };

  function loop(now: number) {
    if (!active) return;
    const frameDelta = Math.min(.1, (now - last) / 1000);
    last = now;
    if (!document.hidden && !paused && !outcome) {
      accumulator += frameDelta;
      while (accumulator >= FIXED_STEP) {
        sim.step(FIXED_STEP);
        accumulator -= FIXED_STEP;
      }
      if (sim.inCup) {
        sim.inCup = false;
        nextHole(true);
      } else if (!sim.moving && shots >= MAX_SHOTS) {
        nextHole(false);
      } else if (sim.moving && now - lastPersisted > 250) {
        persist();
        lastPersisted = now;
      }
    }
    draw(accumulator / FIXED_STEP);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

route();

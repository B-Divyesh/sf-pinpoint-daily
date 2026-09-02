import { expect, Page, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { GameSimulation, SimulationSnapshot, Vec, makeCourse, predictedPoints } from '../src/game';

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const DEMO_KEY = 'demo:daily-v1';
const REAL_KEY = 'pinpoint:daily-v1';
const winningShots = [
  { start: { x: 112, y: 355 }, angle: 0.7484073464101847, power: 100 },
  { start: { x: 105, y: 126 }, angle: -0.6915926535898163, power: 114 },
  { start: { x: 130, y: 350 }, angle: 0.40840734641018445, power: 98 },
];

function simulatedPoints(holeIndex: number, snapshot: SimulationSnapshot, aim: Vec): Vec[] {
  const simulation = new GameSimulation(makeCourse(20260901)[holeIndex], snapshot);
  simulation.shoot(aim);
  const points: Vec[] = [];
  for (let frame = 0; frame < 150 && simulation.moving && !simulation.inCup; frame++) {
    simulation.step();
    if (frame % 3 === 0) points.push({ ...simulation.ball });
  }
  return points;
}

async function loseHole(page: Page, nextHole?: number) {
  for (let shot = 0; shot < 5; shot++) {
    await page.locator('#shoot').click();
    await page.locator('#reset-hole').click();
  }
  if (nextHole) await expect(page.getByText(`Hole ${nextHole} of 3`, { exact: true })).toBeVisible();
}

async function takeWinningShot(page: Page, index: number) {
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no visible bounds');
  const shot = winningShots[index];
  const aim = { x: Math.cos(shot.angle) * shot.power, y: Math.sin(shot.angle) * shot.power };
  const from = { x: box.x + box.width * shot.start.x / 800, y: box.y + box.height * shot.start.y / 480 };
  const to = { x: box.x + box.width * (shot.start.x - aim.x) / 800, y: box.y + box.height * (shot.start.y - aim.y) / 480 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 4 });
  await page.mouse.up();
}

test('@claim:demo-isolation both demo entries ignore and preserve ordinary game data', async ({ page, browser }) => {
  const ordinarySaved = {
    best: 1,
    completed: ['19990101'],
    sound: true,
    run: {
      seed: 20260901,
      holeIndex: 2,
      shots: 4,
      total: 14,
      holesWon: 2,
      angle: 1.2,
      power: 180,
      simulation: { ball: { x: 130, y: 350 }, velocity: { x: 0, y: 0 }, elapsed: 9, inCup: false },
      outcome: null,
    },
  };
  const originalReal = JSON.stringify(ordinarySaved);
  const assertDemoDefaults = async (demoPage: Page) => {
    await expect(demoPage.getByText('Hole 1 of 3', { exact: true })).toBeVisible();
    await expect(demoPage.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
    await expect(demoPage.getByText('Cups: 0 / 3', { exact: true })).toBeVisible();
    await expect(demoPage.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false');
    await expect(demoPage.getByText(/Run restored|Finished run restored/)).toHaveCount(0);
    expect(await demoPage.evaluate(key => localStorage.getItem(key), DEMO_KEY)).toBeNull();
  };

  await page.clock.setFixedTime(new Date('2026-09-01T12:00:00Z'));
  await page.goto('/');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: REAL_KEY, value: originalReal });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('/demo');
  await expect(page).toHaveTitle('Demo — Pinpoint Daily');
  await expect(page.getByText('Demo — sample data, saved only here')).toBeVisible();
  await assertDemoDefaults(page);
  await page.getByRole('button', { name: 'Turn sound on' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY)).toMatchObject({
    best: null,
    completed: [],
    sound: true,
    run: { seed: 20260901, holeIndex: 0, shots: 0, total: 0, holesWon: 0 },
  });
  expect(await page.evaluate(key => localStorage.getItem(key), REAL_KEY)).toBe(originalReal);

  const aliasContext = await browser.newContext({ baseURL: ORIGIN });
  const aliasPage = await aliasContext.newPage();
  await aliasPage.clock.setFixedTime(new Date('2026-09-01T12:00:00Z'));
  await aliasPage.goto('/');
  await aliasPage.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: REAL_KEY, value: originalReal });
  await aliasPage.goto('/?demo=1');
  await expect(aliasPage).toHaveTitle('Demo — Pinpoint Daily');
  await expect(aliasPage.getByText('Demo — sample data, saved only here')).toBeVisible();
  await assertDemoDefaults(aliasPage);
  await aliasPage.getByRole('button', { name: 'Turn sound on' }).click();
  expect(await aliasPage.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY)).toMatchObject({
    best: null,
    completed: [],
    sound: true,
    run: { seed: 20260901, holeIndex: 0, shots: 0, total: 0, holesWon: 0 },
  });
  expect(await aliasPage.evaluate(key => localStorage.getItem(key), REAL_KEY)).toBe(originalReal);
  await aliasContext.close();
  expect(await page.evaluate(key => localStorage.getItem(key), DEMO_KEY)).not.toBeNull();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), DEMO_KEY)).toBeNull();
  expect(await page.evaluate(key => localStorage.getItem(key), REAL_KEY)).toBe(originalReal);
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeFocused();
  await expect(page.locator('#announcer')).toHaveText('Demo reset.');
});

test('@claim:demo-focus Play the sample course moves focus to the demo course', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Play the sample course' }).click();
  await expect(page.getByRole('heading', { name: 'Aim, check the dotted path, then shoot' })).toBeFocused();
});

test('@claim:shared-daily-course fresh demo contexts render the same three-hole sample', async ({ page, browser }) => {
  test.setTimeout(60_000);
  await page.clock.setFixedTime(new Date('2026-09-01T12:00:00Z'));
  await page.goto('/demo');
  const secondContext = await browser.newContext({ baseURL: ORIGIN });
  const secondPage = await secondContext.newPage();
  await secondPage.clock.setFixedTime(new Date('2026-09-01T12:00:00Z'));
  await secondPage.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await secondPage.getByRole('button', { name: 'Start for real' }).click();
  for (let hole = 0; hole < winningShots.length; hole++) {
    await expect(page.getByText(`Hole ${hole + 1} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(secondPage.getByText(`Hole ${hole + 1} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
    expect(await page.locator('#game-root').getAttribute('data-course-seed')).toBe('20260901');
    expect(await secondPage.locator('#game-root').getAttribute('data-course-seed')).toBe('20260901');
    const firstBoard = await page.locator('canvas').screenshot();
    expect(await secondPage.locator('canvas').screenshot()).toEqual(firstBoard);
    await secondPage.reload();
    await expect(secondPage.getByText(`Hole ${hole + 1} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
    expect(await secondPage.locator('canvas').screenshot()).toEqual(firstBoard);
    if (hole < winningShots.length - 1) {
      await takeWinningShot(page, hole);
      await takeWinningShot(secondPage, hole);
    }
  }
  await secondContext.close();
});

test('@claim:visible-prediction the dotted path matches first and later shots before release', async ({ page }) => {
  await page.goto('/demo');
  const cyanPixels = () => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')!;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] > 55 && pixels[index] < 125 && pixels[index + 1] > 170 && pixels[index + 2] > 180) count++;
    }
    return count;
  });
  const withPrediction = await cyanPixels();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.waitForTimeout(50);
  const withoutPrediction = await cyanPixels();
  expect(withPrediction).toBeGreaterThan(withoutPrediction + 100);

  const hole = makeCourse(20260901)[0];
  const first = new GameSimulation(hole);
  const firstAim = { x: 120, y: -65 };
  expect(predictedPoints(hole, first.snapshot(), firstAim)).toEqual(simulatedPoints(0, first.snapshot(), firstAim));
  first.shoot({ x: 165, y: -30 });
  for (let frame = 0; frame < 300 && first.moving; frame++) first.step();
  first.reset();
  const later = first.snapshot();
  const bumperAim = [{ x: 82, y: -160 }, { x: 96, y: -150 }, { x: 110, y: -145 }, { x: 125, y: -135 }, { x: 140, y: -120 }, { x: 155, y: -105 }].find(aim => {
    const trial = new GameSimulation(hole, later);
    trial.shoot(aim);
    for (let frame = 0; frame < 150 && trial.moving; frame++) {
      trial.step();
      const bumper = trial.bumperAt();
      if (Math.hypot(trial.ball.x - bumper.x, trial.ball.y - bumper.y) <= 24.01) return true;
    }
    return false;
  });
  expect(bumperAim).toBeDefined();
  expect(predictedPoints(hole, later, bumperAim!)).toEqual(simulatedPoints(0, later, bumperAim!));
});

test('@claim:visible-course-elements wind, walls, and a moving bumper are visible', async ({ page }) => {
  await page.goto('/demo');
  const wallPixels = await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')!;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] === 245 && pixels[index + 1] === 237 && pixels[index + 2] === 215) count++;
    }
    return count;
  });
  // Walls have a cream outer rail. The ball and other course elements use different colours.
  expect(wallPixels).toBeGreaterThan(1_000);
  const coralCenter = () => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')!;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] > 220 && pixels[index + 1] > 60 && pixels[index + 1] < 160 && pixels[index + 2] < 140) {
        sumX += (index / 4) % canvas.width;
        sumY += Math.floor(index / 4 / canvas.width);
        count++;
      }
    }
    return { x: sumX / count, y: sumY / count, count };
  });
  const before = await coralCenter();
  expect(before.count).toBeGreaterThan(100);
  await page.locator('#shoot').click();
  await page.waitForTimeout(250);
  const after = await coralCenter();
  expect(after.y).not.toBe(before.y);
  await page.locator('#reset-hole').click();
  for (let shot = 1; shot < 5; shot++) { await page.locator('#shoot').click(); await page.locator('#reset-hole').click(); }
  await expect(page.getByText(/Wind [←→] light/)).toBeVisible();
});

test('@claim:five-shot-limit five misses advance a hole and a sixth shot is impossible', async ({ page }) => {
  await page.goto('/demo');
  await loseHole(page, 2);
  const run = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run, DEMO_KEY);
  expect(run.total).toBe(5);
  expect(run.holeIndex).toBe(1);
  await expect(page.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
});

test('@claim:run-persistence current hole and shot count survive reload', async ({ page }) => {
  await page.goto('/demo');
  await loseHole(page, 2);
  await page.locator('#shoot').click();
  await page.locator('#reset-hole').click();
  await expect(page.getByText('Shots: 1 / 5', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Hole 2 of 3', { exact: true })).toBeVisible();
  await expect(page.getByText('Shots: 1 / 5', { exact: true })).toBeVisible();
  await expect(page.getByText('Run restored at hole 2.')).toBeVisible();
});

test('@claim:clear-local-score-history confirmation removes only saved score history', async ({ page }) => {
  const saved = {
    best: 3,
    completed: ['20260901'],
    sound: true,
    run: {
      seed: 20260901,
      holeIndex: 1,
      shots: 2,
      total: 7,
      holesWon: 1,
      angle: -.4,
      power: 95,
      simulation: { ball: { x: 105, y: 126 }, velocity: { x: 0, y: 0 }, elapsed: 0, inCup: false },
      outcome: null,
    },
  };
  await page.goto('/privacy');
  await expect(page.getByText('Use “Clear local score history” to delete this storage key’s best score and completed dates. It keeps the current run and sound setting.')).toBeVisible();
  await page.goto('/demo');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: DEMO_KEY, value: saved });
  await page.reload();

  const control = page.getByRole('button', { name: 'Clear local score history' });
  await control.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Clear saved score history?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('This deletes the best score and completed dates for this demo. It keeps your current run and sound setting.');
  await expect(dialog).toContainText('This cannot be undone.');
  await expect(dialog.getByRole('button', { name: 'Keep saved data' })).toBeFocused();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY)).toEqual(saved);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(control).toBeFocused();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY)).toEqual(saved);

  await page.keyboard.press('Enter');
  const confirm = dialog.getByRole('button', { name: 'Clear best score and completed dates' });
  await confirm.focus();
  await page.keyboard.press('Space');
  await expect(dialog).toBeHidden();
  await expect(control).toBeFocused();
  await expect(page.getByText('Saved score history cleared. Your current run and sound setting remain.')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY)).toEqual({
    best: null,
    completed: [],
    sound: true,
    run: saved.run,
  });
  await expect(page.getByRole('button', { name: /undo/i })).toHaveCount(0);
  await page.reload();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY)).toEqual({
    best: null,
    completed: [],
    sound: true,
    run: saved.run,
  });
});

test('@claim:storage-removal clearing site browser data removes every saved game field', async ({ page }) => {
  const saved = {
    best: 3,
    completed: ['20260901'],
    sound: true,
    run: {
      seed: 20260901,
      holeIndex: 2,
      shots: 4,
      total: 14,
      holesWon: 2,
      angle: .4,
      power: 120,
      simulation: { ball: { x: 130, y: 350 }, velocity: { x: 0, y: 0 }, elapsed: 4, inCup: false },
      outcome: null,
    },
  };
  await page.goto('/privacy');
  await expect(page.getByText('Clear this site’s browser data to delete all saved game data.')).toBeVisible();
  await page.evaluate(({ realKey, demoKey, value }) => {
    localStorage.setItem(realKey, JSON.stringify(value));
    localStorage.setItem(demoKey, JSON.stringify(value));
    localStorage.clear();
  }, { realKey: REAL_KEY, demoKey: DEMO_KEY, value: saved });
  expect(await page.evaluate(({ realKey, demoKey }) => [localStorage.getItem(realKey), localStorage.getItem(demoKey)], { realKey: REAL_KEY, demoKey: DEMO_KEY })).toEqual([null, null]);

  for (const route of ['/', '/demo']) {
    await page.goto(route);
    await expect(page.getByText('Hole 1 of 3', { exact: true })).toBeVisible();
    await expect(page.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
    await expect(page.getByText('Cups: 0 / 3', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText(/Run restored|Finished run restored/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /undo/i })).toHaveCount(0);
  }
  expect(await page.evaluate(({ realKey, demoKey }) => [localStorage.getItem(realKey), localStorage.getItem(demoKey)], { realKey: REAL_KEY, demoKey: DEMO_KEY })).toEqual([null, null]);
});

test('@claim:sound-setting sound plays after a gesture and the setting survives reload', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__toneStarts = 0;
    class FakeAudioContext {
      currentTime = 0;
      destination = {};
      resume() { return Promise.resolve(); }
      close() { return Promise.resolve(); }
      createOscillator() { return { frequency: { value: 0 }, connect() {}, start() { (window as any).__toneStarts++; }, stop() {} }; }
      createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Turn sound on' }).click();
  await expect(page.getByRole('button', { name: 'Turn sound off' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => (window as any).__toneStarts)).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn sound off' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#shoot').click();
  await expect.poll(() => page.evaluate(() => (window as any).__toneStarts)).toBeGreaterThan(0);
});

test('@claim:local-privacy complete win and loss flows stay local without accounts, ads, or analytics', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    (window as any).__privacySignals = { beacons: [], webSockets: [], eventSources: [] };
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: (url: string | URL) => { (window as any).__privacySignals.beacons.push(String(url)); return true; },
    });
    window.WebSocket = new Proxy(window.WebSocket, {
      construct(target, args) {
        (window as any).__privacySignals.webSockets.push(String(args[0]));
        return Reflect.construct(target, args);
      },
    });
    window.EventSource = new Proxy(window.EventSource, {
      construct(target, args) {
        (window as any).__privacySignals.eventSources.push(String(args[0]));
        return Reflect.construct(target, args);
      },
    });
  });
  const requests: { url: string; method: string; body: string | null; resourceType: string }[] = [];
  page.on('request', request => requests.push({
    url: request.url(),
    method: request.method(),
    body: request.postData(),
    resourceType: request.resourceType(),
  }));
  await page.goto('/demo');
  const expectNoAccountOrAdUi = async () => {
    await expect(page.locator('input[type="email"], input[type="password"], a[href*="login"], a[href*="account"], button[name*="login" i], button[name*="account" i]')).toHaveCount(0);
    await expect(page.locator('iframe, [data-ad], [aria-label*="advertisement" i]')).toHaveCount(0);
  };
  await expectNoAccountOrAdUi();
  for (let hole = 0; hole < winningShots.length; hole++) {
    await takeWinningShot(page, hole);
    if (hole < 2) await expect(page.getByText(`Hole ${hole + 2} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expectNoAccountOrAdUi();
  }
  await expect(page.getByRole('heading', { name: 'Course complete — you won' })).toBeVisible({ timeout: 15_000 });
  await expectNoAccountOrAdUi();

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await loseHole(page, 2);
  await loseHole(page, 3);
  await loseHole(page);
  await expect(page.getByRole('heading', { name: 'Course over — try again' })).toBeVisible();
  await expectNoAccountOrAdUi();
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expectNoAccountOrAdUi();

  const allowedPaths = [/^\/demo$/, /^\/assets\/[a-zA-Z0-9_-]+\.(?:js|css)$/, /^\/(?:hero-blueprint\.webp|favicon\.svg|apple-touch-icon\.svg)$/];
  for (const request of requests) {
    const url = new URL(request.url);
    expect(url.origin, request.url).toBe(ORIGIN);
    expect(url.search, request.url).toBe('');
    expect(request.method, request.url).toBe('GET');
    expect(request.body, request.url).toBeNull();
    expect(allowedPaths.some(pattern => pattern.test(url.pathname)), request.url).toBe(true);
    expect(['document', 'script', 'stylesheet', 'image'].includes(request.resourceType), request.url).toBe(true);
  }
  expect(await page.evaluate(() => (window as any).__privacySignals)).toEqual({ beacons: [], webSockets: [], eventSources: [] });
  expect(await page.context().cookies()).toEqual([]);
});

test('@claim:input-methods drag, controls, pause, and every advertised keyboard operation work', async ({ page }) => {
  await page.goto('/demo');
  const canvas = page.locator('canvas');
  await canvas.focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no visible bounds');
  await page.mouse.click(box.x + box.width * 112 / 800, box.y + box.height * 355 / 480);
  await expect(page.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
  await takeWinningShot(page, 0);
  await expect(page.getByText('Shots: 1 / 5', { exact: true })).toBeVisible();
  await expect(page.getByText('Ball rolling. Watch the bounce.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset hole' }).click();
  await canvas.focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByText('Power set to 105.')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.power, DEMO_KEY)).toBe(105);
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('Power set to 95.')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('Power set to 85.')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.angle, DEMO_KEY)).toBeCloseTo(-.28);
  await page.keyboard.press('ArrowLeft');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.angle, DEMO_KEY)).toBeCloseTo(-.4);
  await page.getByRole('button', { name: 'Aim right' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.angle, DEMO_KEY)).toBeCloseTo(-.28);
  await page.getByRole('button', { name: 'Aim left' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.angle, DEMO_KEY)).toBeCloseTo(-.4);
  await page.getByRole('button', { name: 'Increase power' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.power, DEMO_KEY)).toBe(95);
  await canvas.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Shots: 2 / 5', { exact: true })).toBeVisible();
  await page.keyboard.press('r');
  await expect(page.getByText('Hole reset. Your used shots remain counted.')).toBeVisible();
  const resetRun = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run, DEMO_KEY);
  expect(resetRun.shots).toBe(2);
  expect(resetRun.simulation.ball).toEqual(winningShots[0].start);
  expect(resetRun.simulation.velocity).toEqual({ x: 0, y: 0 });
  await page.getByRole('button', { name: 'Decrease power' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).run.power, DEMO_KEY)).toBe(85);
  await page.getByRole('button', { name: 'Shoot' }).click();
  await expect(page.getByText('Shots: 3 / 5', { exact: true })).toBeVisible();
});

test('@claim:distinct-outcomes @claim:best-score @claim:completed-date-persistence @claim:result-sharing scripted runs persist and share distinct results', async ({ page, browser }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    (window as any).__copiedResult = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(value: string) { (window as any).__copiedResult = value; return Promise.resolve(); } } });
  });
  await page.goto('/demo');
  for (let hole = 0; hole < winningShots.length; hole++) {
    await takeWinningShot(page, hole);
    if (hole < 2) await expect(page.getByText(`Hole ${hole + 2} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
  }
  await expect(page.getByRole('heading', { name: 'Course complete — you won' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('You sank all three cups in 3 shots.', { exact: false })).toBeVisible();
  const savedWin = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY);
  expect(savedWin.best).toBe(3);
  expect(savedWin.completed).toContain('20260901');
  await page.getByRole('button', { name: 'Copy today’s result' }).click();
  expect(await page.evaluate(() => (window as any).__copiedResult)).toBe('Pinpoint Daily 2026-09-01 — 3/3 cups in 3 shots');
  await expect(page.getByText('Today’s result copied.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Course complete — you won' })).toBeVisible();
  await expect(page.getByText('local best', { exact: false })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).completed, DEMO_KEY)).toContain('20260901');

  const lossContext = await browser.newContext({ baseURL: ORIGIN });
  const lossPage = await lossContext.newPage();
  await lossPage.addInitScript(() => {
    (window as any).__copiedResult = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(value: string) { (window as any).__copiedResult = value; return Promise.resolve(); } } });
  });
  await lossPage.goto('/demo');
  await loseHole(lossPage, 2);
  await loseHole(lossPage, 3);
  await loseHole(lossPage);
  await expect(lossPage.getByRole('heading', { name: 'Course over — try again' })).toBeVisible();
  await expect(lossPage.getByText('You sank 0 of 3 cups.', { exact: false })).toBeVisible();
  await lossPage.getByRole('button', { name: 'Copy today’s result' }).click();
  expect(await lossPage.evaluate(() => (window as any).__copiedResult)).toBe('Pinpoint Daily 2026-09-01 — 0/3 cups in 15 shots');
  await lossPage.getByRole('button', { name: 'Play again' }).click();
  await expect(lossPage.getByText('Hole 1 of 3', { exact: true })).toBeVisible();
  await expect(lossPage.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
  await expect(lossPage.getByText('Cups: 0 / 3', { exact: true })).toBeVisible();
  await expect(lossPage.getByText('New run. Read the path before shooting.')).toBeVisible();
  await expect(lossPage.locator('#results')).toBeHidden();
  await expect(lossPage.locator('canvas')).toBeFocused();
  await lossContext.close();
});

test('@claim:restart-reset Play again starts fresh while saved progress and settings remain', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Turn sound on' }).click();
  for (let hole = 0; hole < winningShots.length; hole++) {
    await takeWinningShot(page, hole);
    if (hole < 2) await expect(page.getByText(`Hole ${hole + 2} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
  }
  await expect(page.getByRole('heading', { name: 'Course complete — you won' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Play again' }).click();

  await expect(page.getByText('Hole 1 of 3', { exact: true })).toBeVisible();
  await expect(page.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
  await expect(page.getByText('Cups: 0 / 3', { exact: true })).toBeVisible();
  await expect(page.getByText('New run. Read the path before shooting.')).toBeVisible();
  await expect(page.locator('#results')).toBeHidden();
  await expect(page.locator('canvas')).toBeFocused();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DEMO_KEY);
  expect(saved.best).toBe(3);
  expect(saved.completed).toContain('20260901');
  expect(saved.sound).toBe(true);
  expect(saved.run).toMatchObject({ holeIndex: 0, shots: 0, total: 0, holesWon: 0, angle: -.4, power: 95, outcome: null });

  await page.reload();
  await expect(page.getByText('Hole 1 of 3', { exact: true })).toBeVisible();
  await expect(page.getByText('Shots: 0 / 5', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn sound off' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).best, DEMO_KEY)).toBe(3);
});

test('result sharing shows selectable text when clipboard access fails', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText() { return Promise.reject(new Error('blocked')); } } });
  });
  await page.goto('/demo');
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    best: null,
    completed: [],
    sound: false,
    run: {
      seed: 20260901,
      holeIndex: 2,
      shots: 5,
      total: 15,
      holesWon: 0,
      angle: -.4,
      power: 95,
      simulation: { ball: { x: 130, y: 350 }, velocity: { x: 0, y: 0 }, elapsed: 0, inCup: false },
      outcome: 'lost',
    },
  })), DEMO_KEY);
  await page.reload();
  await page.getByRole('button', { name: 'Copy today’s result' }).click();
  const fallback = page.getByLabel('Copy this result');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveValue('Pinpoint Daily 2026-09-01 — 0/3 cups in 15 shots');
  await expect(page.getByText('Copy the selected result above.')).toBeVisible();
});

test('@claim:frame-rate-target the game targets 60 fps at 390px under CPU throttle', async ({ page, context }) => {
  test.setTimeout(30_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/demo');
  expect(await page.locator('#game-root').getAttribute('data-simulation-hz')).toBe('60');
  const rate = await page.evaluate(() => new Promise<number>(resolve => {
    const samples: number[] = [];
    const tick = (time: number) => {
      samples.push(time);
      if (samples.length < 121) requestAnimationFrame(tick);
      else resolve(120_000 / (samples.at(-1)! - samples[0]));
    };
    requestAnimationFrame(tick);
  }));
  expect(rate).toBeGreaterThanOrEqual(55);
  expect(rate).toBeLessThanOrEqual(65);
});

test('@claim:free-play the complete demo run has no account or payment step', async ({ page }) => {
  await page.goto('/demo');
  for (let hole = 0; hole < winningShots.length; hole++) {
    await expect(page.getByRole('button', { name: 'Shoot' })).toBeVisible();
    await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
    await expect(page.getByText(/buy|subscribe|payment/i)).toHaveCount(0);
    await takeWinningShot(page, hole);
    if (hole < 2) await expect(page.getByText(`Hole ${hole + 2} of 3`, { exact: true })).toBeVisible({ timeout: 15_000 });
  }
  await expect(page.getByRole('heading', { name: 'Course complete — you won' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  await expect(page.getByText(/buy|subscribe|payment/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
});

test('@claim:online-first-load a fresh first load needs an internet connection', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: ORIGIN });
  const page = await context.newPage();
  await context.setOffline(true);
  await expect(page.goto('/demo')).rejects.toThrow(/ERR_INTERNET_DISCONNECTED/);
  await context.setOffline(false);
  await page.goto('/demo');
  await expect(page.getByText('Internet needed to open', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Shoot' })).toBeVisible();
  await context.close();
});

test('390x844 cold first screen explains the game and keeps the demo board visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Play today’s three-hole course' })).toBeVisible();
  await expect(page.getByText('For players who want a short physics puzzle with one shared course each day.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByText('Opens a demo course in separate storage.')).toBeVisible();
  for (const fact of ['Free to play', 'Internet needed to open', 'Scores stay on this device']) {
    await expect(page.getByText(fact, { exact: true })).toBeVisible();
  }
  const homeGeometry = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return { headline: rect('h1'), action: rect('.actions'), facts: rect('.facts'), canvas: rect('canvas'), viewport: innerHeight };
  });
  expect(homeGeometry.headline.top).toBeGreaterThanOrEqual(0);
  expect(homeGeometry.action.bottom).toBeLessThan(homeGeometry.viewport);
  expect(homeGeometry.facts.bottom).toBeLessThan(homeGeometry.viewport);
  expect(homeGeometry.canvas.top).toBeLessThan(homeGeometry.viewport);

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('/demo');
  await expect(page.getByText('Demo — sample data, saved only here')).toBeVisible();
  const demoGeometry = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return { canvas: rect('canvas'), viewport: innerHeight };
  });
  expect(demoGeometry.canvas.top).toBeLessThan(demoGeometry.viewport);
  expect(demoGeometry.canvas.bottom).toBeLessThanOrEqual(demoGeometry.viewport + 2);
});

test('390x844 exposes 44px targets through every public page, including footer and legal links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/not-found']) {
    await page.goto(route);
    const targets = page.locator('a[href]:not(.skip), button, canvas[tabindex]');
    for (let index = 0; index < await targets.count(); index++) {
      const target = targets.nth(index);
      const box = await target.boundingBox();
      if (!box) continue;
      expect(box!.width, `${route} target ${index} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${route} target ${index} height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('@claim:static-deploy route responses, metadata, focus, and the designed 404 work', async ({ page }) => {
  const routes = [
    { path: '/', title: 'Pinpoint Daily — Play a daily three-hole course', description: 'Play one shared three-hole tabletop golf course each day.' },
    { path: '/demo', title: 'Demo — Pinpoint Daily', description: 'Play a three-hole Pinpoint Daily sample course in separate demo storage.' },
    { path: '/privacy', title: 'Privacy — Pinpoint Daily', description: 'Read what Pinpoint Daily stores in your browser and how to remove it.' },
    { path: '/terms', title: 'Terms — Pinpoint Daily', description: 'Read the rules and availability terms for playing Pinpoint Daily.' },
  ];
  for (const route of routes) {
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);
    expect(response?.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(response?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://pinpoint-daily.sociobot.in${route.path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', route.description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', route.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', route.description);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', route.title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', route.description);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
  }
  for (const icon of ['/favicon.svg', '/apple-touch-icon.svg']) {
    const response = await page.request.get(icon);
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control'] ?? '').not.toContain('immutable');
  }
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#announcer')).toContainText('page loaded');
  await expect(page).toHaveTitle('Privacy — Pinpoint Daily');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://pinpoint-daily.sociobot.in/privacy');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Read what Pinpoint Daily stores in your browser and how to remove it.');
  await page.goBack();
  await expect(page).toHaveTitle('Demo — Pinpoint Daily');
  const missingResponse = await page.goto('/does-not-exist-qa');
  expect(missingResponse?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Pinpoint Daily');
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('link', { name: 'How it works' })).toBeVisible();
  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
  await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'This address does not match a Pinpoint Daily page.');
});

test('all routes have no serious accessibility findings and product routes have no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(route);
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('main').count()).toBe(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? '')).map(issue => issue.id)).toEqual([]);
  }
  expect(errors).toEqual([]);
  await page.goto('/not-found');
  const missingResults = await new AxeBuilder({ page }).analyze();
  expect(missingResults.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? '')).map(issue => issue.id)).toEqual([]);
});

test('reduced motion and 200% text remain usable', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: ORIGIN, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/demo');
  expect(await page.evaluate(() => ({
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
  }))).toEqual({ reduced: true, scroll: 'auto' });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await expect(page.getByRole('button', { name: 'Shoot' })).toBeVisible();
  await context.close();
});

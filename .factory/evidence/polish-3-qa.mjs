import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const [origin, outputDir] = process.argv.slice(2);
if (!origin || !outputDir) throw new Error('usage: node polish-3-qa.mjs <origin> <output-dir>');
mkdirSync(outputDir, { recursive: true });

const demoKey = 'demo:daily-v1';
const realKey = 'pinpoint:daily-v1';
const winningShots = [
  { start: { x: 112, y: 355 }, angle: 0.7484073464101847, power: 100 },
  { start: { x: 105, y: 126 }, angle: -0.6915926535898163, power: 114 },
  { start: { x: 130, y: 350 }, angle: 0.40840734641018445, power: 98 },
];

function check(value, message) {
  if (!value) throw new Error(message);
}

async function takeWinningShot(page, index) {
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  check(box, 'canvas has no bounding box');
  const shot = winningShots[index];
  const aim = { x: Math.cos(shot.angle) * shot.power, y: Math.sin(shot.angle) * shot.power };
  const from = { x: box.x + box.width * shot.start.x / 800, y: box.y + box.height * shot.start.y / 480 };
  const to = { x: box.x + box.width * (shot.start.x - aim.x) / 800, y: box.y + box.height * (shot.start.y - aim.y) / 480 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 4 });
  await page.mouse.up();
}

async function loseHole(page, nextHole) {
  for (let shot = 0; shot < 5; shot++) {
    await page.locator('#shoot').click();
    await page.locator('#reset-hole').click();
  }
  if (nextHole) await page.getByText(`Hole ${nextHole} of 3`, { exact: true }).waitFor({ timeout: 15_000 });
}

const browser = await chromium.launch({ headless: true });
const report = { origin, checkedAt: new Date().toISOString() };

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileContext.newPage();
const homeResponse = await mobilePage.goto(`${origin}/`, { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: `${outputDir}/cold-home-mobile.png`, fullPage: false });
const ordinary = JSON.stringify({
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
});
await mobilePage.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: realKey, value: ordinary });
await mobilePage.getByRole('link', { name: 'Try it with sample data' }).click();
await mobilePage.waitForURL(`${origin}/demo`);
await mobilePage.screenshot({ path: `${outputDir}/isolated-demo-mobile.png`, fullPage: false });
report.firstScreen = await mobilePage.evaluate(({ demoKey, realKey }) => ({
  title: document.title,
  h1: document.querySelector('h1')?.textContent,
  facts: [...document.querySelectorAll('.facts li')].map(node => node.textContent),
  banner: document.querySelector('.demo-banner')?.textContent?.replace(/\s+/g, ' ').trim(),
  demoStorage: localStorage.getItem(demoKey),
  realStorage: localStorage.getItem(realKey),
  canvas: document.querySelector('canvas')?.getBoundingClientRect().toJSON(),
  viewportHeight: innerHeight,
}), { demoKey, realKey });
check(homeResponse?.status() === 200, 'home did not return 200');
check(report.firstScreen.demoStorage === null, 'demo read or created storage before interaction');
check(report.firstScreen.realStorage === ordinary, 'demo changed ordinary storage');
check(report.firstScreen.facts.includes('Internet needed to open'), 'connectivity fact missing');
check(report.firstScreen.canvas.top < report.firstScreen.viewportHeight, 'demo board is not in the first mobile viewport');
await mobileContext.close();

const winContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const winPage = await winContext.newPage();
await winPage.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
const holeScreens = [];
for (let hole = 0; hole < winningShots.length; hole++) {
  await winPage.getByText(`Hole ${hole + 1} of 3`, { exact: true }).waitFor({ timeout: 15_000 });
  const path = `${outputDir}/shared-hole-${hole + 1}.png`;
  await winPage.locator('canvas').screenshot({ path });
  holeScreens.push(path);
  await takeWinningShot(winPage, hole);
}
await winPage.getByRole('heading', { name: 'Course complete — you won' }).waitFor({ timeout: 15_000 });
await winPage.screenshot({ path: `${outputDir}/win-end.png`, fullPage: true });
const winState = await winPage.evaluate(key => JSON.parse(localStorage.getItem(key)), demoKey);
await winPage.getByRole('button', { name: 'Play again' }).click();
await winPage.screenshot({ path: `${outputDir}/win-restart.png`, fullPage: false });
const winRestart = await winPage.evaluate(key => ({
  save: JSON.parse(localStorage.getItem(key)),
  resultHidden: document.querySelector('#results')?.hidden,
  focus: document.activeElement?.getAttribute('aria-label'),
}), demoKey);
check(winState.run.outcome === 'won' && winState.best === 3, 'win did not reach its result');
check(winRestart.save.run.holeIndex === 0 && winRestart.save.run.shots === 0, 'win restart did not reset the run');
check(winRestart.resultHidden && winRestart.focus === 'Interactive tabletop golf course', 'win restart did not restore the focused board');
report.win = { state: winState, restart: winRestart, holeScreens };
await winContext.close();

const lossContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const lossPage = await lossContext.newPage();
await lossPage.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
await loseHole(lossPage, 2);
await loseHole(lossPage, 3);
await loseHole(lossPage);
await lossPage.getByRole('heading', { name: 'Course over — try again' }).waitFor({ timeout: 15_000 });
await lossPage.screenshot({ path: `${outputDir}/loss-end.png`, fullPage: true });
const lossState = await lossPage.evaluate(key => JSON.parse(localStorage.getItem(key)), demoKey);
await lossPage.getByRole('button', { name: 'Play again' }).click();
await lossPage.screenshot({ path: `${outputDir}/loss-restart.png`, fullPage: false });
const lossRestart = await lossPage.evaluate(key => ({
  save: JSON.parse(localStorage.getItem(key)),
  resultHidden: document.querySelector('#results')?.hidden,
  focus: document.activeElement?.getAttribute('aria-label'),
}), demoKey);
check(lossState.run.outcome === 'lost' && lossState.run.total === 15, 'loss did not reach its result');
check(lossRestart.save.run.holeIndex === 0 && lossRestart.save.run.shots === 0, 'loss restart did not reset the run');
check(lossRestart.resultHidden && lossRestart.focus === 'Interactive tabletop golf course', 'loss restart did not restore the focused board');
report.loss = { state: lossState, restart: lossRestart };
await lossContext.close();

const routeContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const routePage = await routeContext.newPage();
const privacyResponse = await routePage.goto(`${origin}/privacy`, { waitUntil: 'networkidle' });
await routePage.screenshot({ path: `${outputDir}/privacy.png`, fullPage: true });
const missingResponse = await routePage.goto(`${origin}/not-a-polish-3-route`, { waitUntil: 'networkidle' });
await routePage.screenshot({ path: `${outputDir}/not-found.png`, fullPage: true });
const iconHeaders = {};
for (const icon of ['/favicon.svg', '/apple-touch-icon.svg']) {
  const response = await routeContext.request.get(`${origin}${icon}`);
  iconHeaders[icon] = { status: response.status(), cacheControl: response.headers()['cache-control'] };
  check(response.status() === 200 && !response.headers()['cache-control']?.includes('immutable'), `${icon} remains immutable`);
}
report.routes = {
  privacyStatus: privacyResponse?.status(),
  missingStatus: missingResponse?.status(),
  missingTitle: await routePage.title(),
  iconHeaders,
};
check(report.routes.privacyStatus === 200 && report.routes.missingStatus === 404, 'route status check failed');
await routeContext.close();

writeFileSync(`${outputDir}/qa.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  firstScreen: report.firstScreen,
  win: { outcome: report.win.state.run.outcome, restart: report.win.restart },
  loss: { outcome: report.loss.state.run.outcome, restart: report.loss.restart },
  routes: report.routes,
}, null, 2));
await browser.close();

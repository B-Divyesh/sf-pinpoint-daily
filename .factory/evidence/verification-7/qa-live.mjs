import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const origin = 'https://pinpoint-daily.sociobot.in';
const demoKey = 'demo:daily-v1';
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
  check(box, 'canvas has no box');
  const shot = winningShots[index];
  const aim = {
    x: Math.cos(shot.angle) * shot.power,
    y: Math.sin(shot.angle) * shot.power,
  };
  const from = {
    x: box.x + box.width * shot.start.x / 800,
    y: box.y + box.height * shot.start.y / 480,
  };
  const to = {
    x: box.x + box.width * (shot.start.x - aim.x) / 800,
    y: box.y + box.height * (shot.start.y - aim.y) / 480,
  };
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
  if (nextHole) await page.getByText('Hole ' + nextHole + ' of 3', { exact: true }).waitFor();
}

const browser = await chromium.launch({ headless: true });
const report = {};

const winContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const winPage = await winContext.newPage();
const requests = [];
const responses = [];
const errors = [];
winPage.on('request', request => requests.push({ method: request.method(), url: request.url() }));
winPage.on('response', response => responses.push({ url: response.url(), status: response.status() }));
winPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
winPage.on('pageerror', error => errors.push(error.message));
const rootResponse = await winPage.goto(origin + '/', { waitUntil: 'networkidle' });
await winPage.getByRole('link', { name: 'Try it with sample data' }).click();
await winPage.waitForURL(origin + '/demo');
for (let index = 0; index < winningShots.length; index++) {
  await takeWinningShot(winPage, index);
  if (index < 2) await winPage.getByText('Hole ' + (index + 2) + ' of 3', { exact: true }).waitFor({ timeout: 15000 });
}
await winPage.getByRole('heading', { name: 'Course complete — you won' }).waitFor({ timeout: 15000 });
await winPage.screenshot({ path: '.factory/evidence/verification-7/live-win-end.png', fullPage: true });
const winState = await winPage.evaluate(key => JSON.parse(localStorage.getItem(key)), demoKey);
const winResult = await winPage.locator('#results').innerText();
check(winState.best === 3 && winState.run.outcome === 'won', 'winning run did not persist');
await winPage.getByRole('button', { name: 'Play again' }).click();
const restart = await winPage.evaluate(key => ({
  storage: JSON.parse(localStorage.getItem(key)),
  focus: document.activeElement?.getAttribute('aria-label'),
  resultHidden: document.querySelector('#results')?.hidden,
}), demoKey);
check(restart.storage.run.holeIndex === 0 && restart.storage.run.shots === 0 && restart.storage.best === 3, 'restart did not reset run and preserve best');
await winPage.reload({ waitUntil: 'networkidle' });
const reloadState = await winPage.evaluate(key => JSON.parse(localStorage.getItem(key)), demoKey);
check(reloadState.best === 3 && reloadState.run.holeIndex === 0, 'restart state did not survive reload');
report.win = { result: winResult, stored: winState, restart, reloadState };
report.network = {
  requests: [...new Map(requests.map(item => [item.method + ' ' + item.url, item])).values()],
  nonSameOrigin: requests.filter(request => new URL(request.url).origin !== origin),
  nonGet: requests.filter(request => request.method !== 'GET'),
  badResponses: responses.filter(response => response.status >= 400),
  cookies: await winContext.cookies(),
  consoleAndPageErrors: errors,
  rootHeaders: rootResponse?.headers(),
  serviceWorkers: winContext.serviceWorkers().length,
};
check(report.network.nonSameOrigin.length === 0, 'third-party request observed');
check(report.network.nonGet.length === 0, 'non-GET request observed');
check(report.network.cookies.length === 0, 'cookie observed');
check(errors.length === 0, 'console/page error observed');
await winContext.close();

const lossContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const lossPage = await lossContext.newPage();
await lossPage.goto(origin + '/demo', { waitUntil: 'networkidle' });
await loseHole(lossPage, 2);
await loseHole(lossPage, 3);
await loseHole(lossPage);
await lossPage.getByRole('heading', { name: 'Course over — try again' }).waitFor({ timeout: 15000 });
await lossPage.screenshot({ path: '.factory/evidence/verification-7/live-loss-end.png', fullPage: true });
report.loss = {
  result: await lossPage.locator('#results').innerText(),
  stored: await lossPage.evaluate(key => JSON.parse(localStorage.getItem(key)), demoKey),
};
check(report.loss.stored.run.total === 15 && report.loss.stored.run.outcome === 'lost', 'loss run did not reach terminal state');
await lossContext.close();

const edgeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const edgePage = await edgeContext.newPage();
await edgePage.goto(origin + '/demo', { waitUntil: 'networkidle' });
const canvas = edgePage.locator('canvas');
const canvasBox = await canvas.boundingBox();
check(canvasBox, 'edge canvas has no box');
await edgePage.mouse.click(canvasBox.x + canvasBox.width * 112 / 800, canvasBox.y + canvasBox.height * 355 / 480);
const zeroDragShots = await edgePage.locator('#shot-label').innerText();
await canvas.focus();
await edgePage.keyboard.press('Escape');
await edgePage.keyboard.press('Enter');
const pausedShots = await edgePage.locator('#shot-label').innerText();
await edgePage.keyboard.press('Escape');
for (let index = 0; index < 20; index++) await edgePage.keyboard.press('ArrowUp');
const maxPower = await edgePage.evaluate(key => JSON.parse(localStorage.getItem(key)).run.power, demoKey);
for (let index = 0; index < 30; index++) await edgePage.keyboard.press('ArrowDown');
const minPower = await edgePage.evaluate(key => JSON.parse(localStorage.getItem(key)).run.power, demoKey);
await edgePage.evaluate(key => localStorage.setItem(key, '{bad json'), demoKey);
await edgePage.reload({ waitUntil: 'networkidle' });
const corruptRecovery = {
  hole: await edgePage.locator('#hole-label').innerText(),
  shots: await edgePage.locator('#shot-label').innerText(),
};
check(zeroDragShots === 'Shots: 0 / 5' && pausedShots === 'Shots: 0 / 5', 'invalid or paused shot consumed a turn');
check(maxPower === 180 && minPower === 30, 'power boundaries were not enforced');
check(corruptRecovery.hole === 'Hole 1 of 3' && corruptRecovery.shots === 'Shots: 0 / 5', 'corrupt storage did not recover');
report.boundaries = { zeroDragShots, pausedShots, maxPower, minPower, corruptRecovery };

const focusSequence = [];
await edgePage.goto(origin + '/demo');
for (let index = 0; index < 22; index++) {
  await edgePage.keyboard.press('Tab');
  focusSequence.push(await edgePage.evaluate(() => {
    const active = document.activeElement;
    const style = active ? getComputedStyle(active) : null;
    return {
      name: active?.getAttribute('aria-label') || active?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 45),
      tag: active?.tagName,
      outlineWidth: style?.outlineWidth,
      outlineStyle: style?.outlineStyle,
    };
  }));
}
console.log(JSON.stringify({ focusSequence }, null, 2));
check(focusSequence.filter(item => ['A', 'BUTTON', 'CANVAS'].includes(item.tag)).every(item => item.outlineStyle !== 'none' && item.outlineWidth !== '0px'), 'keyboard focus was not visible');
report.keyboardFocus = focusSequence;
await edgeContext.close();

const keyboardContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const keyboardPage = await keyboardContext.newPage();
await keyboardPage.goto(origin + '/demo', { waitUntil: 'networkidle' });
const keyboardCanvas = keyboardPage.locator('canvas');
await keyboardCanvas.focus();
for (let index = 0; index < 4; index++) await keyboardPage.keyboard.press('ArrowLeft');
for (let index = 0; index < 2; index++) await keyboardPage.keyboard.press('ArrowUp');
await keyboardPage.keyboard.press('Enter');
await keyboardPage.getByText('Hole 2 of 3', { exact: true }).waitFor({ timeout: 15000 });
await keyboardCanvas.focus();
for (let index = 0; index < 4; index++) await keyboardPage.keyboard.press('ArrowLeft');
for (let index = 0; index < 8; index++) await keyboardPage.keyboard.press('ArrowUp');
await keyboardPage.keyboard.press('Enter');
await keyboardPage.getByText('Hole 3 of 3', { exact: true }).waitFor({ timeout: 15000 });
await keyboardCanvas.focus();
for (let index = 0; index < 6; index++) await keyboardPage.keyboard.press('ArrowRight');
for (let index = 0; index < 6; index++) await keyboardPage.keyboard.press('ArrowUp');
await keyboardPage.keyboard.press('Enter');
await keyboardPage.getByRole('heading', { name: 'Course complete — you won' }).waitFor({ timeout: 15000 });
report.keyboardWin = {
  result: await keyboardPage.locator('#results').innerText(),
  focusedRole: await keyboardPage.evaluate(() => document.activeElement?.id),
};
check(report.keyboardWin.focusedRole === 'results', 'keyboard result did not receive focus');
await keyboardContext.close();

const axeContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const axePage = await axeContext.newPage();
const axeResults = [];
for (const path of ['/', '/demo', '/privacy', '/terms', '/not-found-verification']) {
  const response = await axePage.goto(origin + path, { waitUntil: 'networkidle' });
  const analysis = await new AxeBuilder({ page: axePage }).analyze();
  const serious = analysis.violations.filter(item => item.impact === 'serious' || item.impact === 'critical');
  axeResults.push({ path, status: response?.status(), all: analysis.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })), serious });
  check(serious.length === 0, 'axe serious/critical finding on ' + path);
}
report.axe = axeResults;
await axeContext.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(origin + '/demo', { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: '.factory/evidence/verification-7/live-demo-mobile.png', fullPage: false });
const mobile = await mobilePage.evaluate(() => {
  const canvas = document.querySelector('canvas').getBoundingClientRect();
  const action = document.querySelector('.actions').getBoundingClientRect();
  const smallTargets = [...document.querySelectorAll('a[href]:not(.skip),button,canvas[tabindex]')].map(element => {
    const rect = element.getBoundingClientRect();
    return { name: element.getAttribute('aria-label') || element.textContent?.trim(), width: rect.width, height: rect.height };
  }).filter(item => item.width > 0 && item.height > 0 && (item.width < 44 || item.height < 44));
  document.documentElement.style.fontSize = '200%';
  return {
    canvasTop: canvas.top,
    canvasBottom: canvas.bottom,
    actionBottom: action.bottom,
    viewportHeight: innerHeight,
    smallTargets,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    overflowAt200Percent: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
});
check(mobile.canvasTop < 844 && mobile.canvasBottom <= 846 && mobile.actionBottom < 844, 'mobile first screen does not show action and full game board');
check(mobile.smallTargets.length === 0, 'small mobile target found');
check(mobile.reducedMotion && mobile.scrollBehavior === 'auto', 'reduced motion not respected');
check(!mobile.overflowAt200Percent, '200% text causes horizontal overflow');
report.mobile = mobile;
await mobileContext.close();

const fpsContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const fpsPage = await fpsContext.newPage();
const cdp = await fpsContext.newCDPSession(fpsPage);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await fpsPage.goto(origin + '/demo', { waitUntil: 'networkidle' });
const fps = await fpsPage.evaluate(() => new Promise(resolve => {
  const samples = [];
  const tick = time => {
    samples.push(time);
    if (samples.length < 121) requestAnimationFrame(tick);
    else resolve({ frames: 120, elapsedMs: samples.at(-1) - samples[0], fps: 120000 / (samples.at(-1) - samples[0]), hz: document.querySelector('#game-root')?.getAttribute('data-simulation-hz') });
  };
  requestAnimationFrame(tick);
}));
check(fps.hz === '60' && fps.fps >= 55 && fps.fps <= 65, '60 fps target failed');
report.fps = fps;
await fpsContext.close();

writeFileSync('.factory/evidence/verification-7/independent-live.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  win: report.win.result,
  loss: report.loss.result,
  network: report.network,
  boundaries: report.boundaries,
  keyboardWin: report.keyboardWin,
  axe: report.axe,
  mobile: report.mobile,
  fps: report.fps,
}, null, 2));
await browser.close();

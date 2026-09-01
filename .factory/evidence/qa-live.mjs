import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://pinpoint-daily.sociobot.in';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const responses = [];
const consoleMessages = [];
const pageErrors = [];
page.on('request', request => requests.push(request.url()));
page.on('response', response => responses.push({ url: response.url(), status: response.status(), headers: response.headers() }));
page.on('console', message => consoleMessages.push({ type: message.type(), text: message.text() }));
page.on('pageerror', error => pageErrors.push(error.message));

const rootResponse = await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
const desktop = await page.evaluate(() => ({
  title: document.title,
  lang: document.documentElement.lang,
  h1Count: document.querySelectorAll('h1').length,
  mainCount: document.querySelectorAll('main').length,
  imagesWithoutAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length,
  firstHeading: document.querySelector('h1')?.textContent,
  sampleAction: [...document.querySelectorAll('a,button')].find(element => element.textContent?.includes('Try it with sample data'))?.textContent,
  gameVisible: Boolean(document.querySelector('canvas')?.getBoundingClientRect().height),
}));
const axe = await new AxeBuilder({ page }).analyze();
const raf = await page.evaluate(() => new Promise(resolve => {
  const samples = [];
  const tick = time => {
    samples.push(time);
    if (samples.length < 122) requestAnimationFrame(tick);
    else {
      const elapsed = samples.at(-1) - samples[0];
      resolve({ frames: samples.length - 1, elapsedMs: elapsed, fps: (samples.length - 1) * 1000 / elapsed });
    }
  };
  requestAnimationFrame(tick);
}));

const routeResults = [];
for (const path of ['/demo', '/privacy', '/terms']) {
  const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  routeResults.push(await page.evaluate(({ path, status }) => ({
    path,
    status,
    title: document.title,
    h1: [...document.querySelectorAll('h1')].map(node => node.textContent),
    mainCount: document.querySelectorAll('main').length,
  }), { path, status: response?.status() }));
}

await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
const focusSequence = [];
for (let index = 0; index < 22; index++) {
  await page.keyboard.press('Tab');
  focusSequence.push(await page.evaluate(() => {
    const active = document.activeElement;
    const style = active ? getComputedStyle(active) : null;
    return {
      tag: active?.tagName,
      text: active?.textContent?.trim().slice(0, 40),
      ariaLabel: active?.getAttribute('aria-label'),
      outline: style ? `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}` : null,
    };
  }));
}

await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
const canvas = page.locator('canvas');
const box = await canvas.boundingBox();
if (!box) throw new Error('Canvas has no box');
await page.mouse.move(box.x + box.width * 112 / 800, box.y + box.height * 355 / 480);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(100);
const clickWithoutDrag = await page.locator('#shot-label').textContent();

await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
for (let shot = 0; shot < 5; shot++) {
  await page.locator('#shoot').evaluate(element => element.click());
  await page.locator('#reset-hole').evaluate(element => element.click());
  await page.waitForTimeout(50);
}
const progressBeforeReload = await page.evaluate(() => ({
  hole: document.querySelector('#hole-label')?.textContent,
  shots: document.querySelector('#shot-label')?.textContent,
  storage: localStorage.getItem('demo:daily-v1'),
}));
await page.reload({ waitUntil: 'networkidle' });
const progressAfterReload = await page.evaluate(() => ({
  hole: document.querySelector('#hole-label')?.textContent,
  shots: document.querySelector('#shot-label')?.textContent,
  storage: localStorage.getItem('demo:daily-v1'),
}));

await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.locator('#sound').evaluate(element => element.click());
const settingsBeforeReload = await page.evaluate(() => ({
  label: document.querySelector('#sound')?.textContent,
  storage: localStorage.getItem('demo:daily-v1'),
  banner: document.querySelector('.demo-banner')?.textContent,
}));
await page.reload({ waitUntil: 'networkidle' });
const settingsAfterReload = await page.evaluate(() => ({
  label: document.querySelector('#sound')?.textContent,
  storage: localStorage.getItem('demo:daily-v1'),
}));

const mobilePage = await context.newPage();
await mobilePage.setViewportSize({ width: 390, height: 844 });
await mobilePage.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: '.factory/evidence/live-mobile-390.png', fullPage: false });
const mobileTargets = await mobilePage.evaluate(() => [...document.querySelectorAll('a[href],button,canvas[tabindex]')]
  .map(element => {
    const rect = element.getBoundingClientRect();
    return { text: element.textContent?.trim() || element.getAttribute('aria-label'), width: rect.width, height: rect.height, top: rect.top, left: rect.left };
  })
  .filter(target => target.width > 0 && target.height > 0 && target.left < innerWidth && target.top < innerHeight && (target.width < 44 || target.height < 44)));

const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
const reducedMotion = await reducedPage.evaluate(() => ({
  matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
  scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  animationDurations: [...document.querySelectorAll('*')].map(element => getComputedStyle(element).animationDuration).filter(value => value !== '0s').slice(0, 10),
  transitionDurations: [...document.querySelectorAll('*')].map(element => getComputedStyle(element).transitionDuration).filter(value => value !== '0s').slice(0, 10),
}));
await reducedContext.close();

const output = {
  rootStatus: rootResponse?.status(),
  rootHeaders: rootResponse?.headers(),
  desktop,
  seriousOrCriticalAxe: axe.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? '')).map(issue => ({ id: issue.id, impact: issue.impact, nodes: issue.nodes.length })),
  allAxe: axe.violations.map(issue => ({ id: issue.id, impact: issue.impact, nodes: issue.nodes.length })),
  raf,
  routeResults,
  focusSequence,
  clickWithoutDrag,
  progressBeforeReload,
  progressAfterReload,
  settingsBeforeReload,
  settingsAfterReload,
  mobileTargets,
  reducedMotion,
  requests: [...new Set(requests)],
  nonSameOriginRequests: [...new Set(requests)].filter(url => new URL(url).origin !== origin),
  badResponses: responses.filter(response => response.status >= 400),
  consoleMessages,
  pageErrors,
};
console.log(JSON.stringify(output, null, 2));
await context.close();
await browser.close();

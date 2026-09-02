# Independent verification 8 — PASS

**Candidate:** `531e5b28e1023382710e7a3ce8a6458db6854358`
**Live URL:** https://pinpoint-daily.sociobot.in
**Verified:** 2026-09-02 UTC
**Result:** **PASS**

## Cold first read and demo

A cold desktop visit returned HTTP 200 with no console or page errors. The first screen plainly answers the required questions:

- **What:** “Play today’s three-hole course.”
- **For whom:** “For players who want a short physics puzzle with one shared course each day.”
- **First action:** “Try it with sample data,” with adjacent text: “Opens a demo course in separate storage.”

The primary action opens `/demo`, which has a persistent “Demo — sample data, saved only here” banner, Reset demo, and Start for real. Both the cold desktop capture and 390×844 demo capture visibly include the playable game board rather than a menu wall.

## Required claims — PASS (21/21)

From the clean candidate checkout, after `npm ci`, I ran every command in `.factory/claims.json` separately through the shipped production/demo entry point. Every command passed:

- `demo-isolation`, `demo-focus`, `shared-daily-course`, `visible-prediction`, `visible-course-elements`, `five-shot-limit`, `run-persistence`
- `sound-setting`, `local-privacy`, `input-methods`, `distinct-outcomes`, `best-score`, `restart-reset`, `completed-date-persistence`
- `clear-local-score-history`, `storage-removal`, `result-sharing`, `frame-rate-target`, `free-play`, `online-first-load`, `static-deploy`

The registry has one tagged browser test for each claim. The demo uses `demo:daily-v1`, isolated from `pinpoint:daily-v1`; the test suite verifies both `/demo` and `/?demo=1` against contradictory ordinary saved state.

## Local quality gates — PASS

```text
npm ci                 PASS (60 packages, 0 vulnerabilities)
npm test               PASS (11/11)
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS; dist/ produced
npm run test:browser   PASS (23/23, final clean rerun)
```

The built initial JavaScript is 21,420 B raw / 8,099 B gzip; CSS is 7,623 B raw / 2,416 B gzip; the only first-screen raster is the 81,670 B WebP. These are within the applicable 200 KB JS, 50 KB CSS, 300 KB hero, and 2 MB casual-game budgets.

## Live deployment identity, routes, and security — PASS

The public `index.html`, 404 page/CSS, icons, hero, social card, robots, sitemap, and hashed JS/CSS are byte-identical to this candidate’s rebuilt `dist/` (11 browser-served artifacts compared by SHA-256). `staticwebapp.config.json` is deployment configuration and is correctly not browser-served.

- `/`, `/demo`, `/privacy`, `/terms`: 200; an unknown route: designed 404.
- All crawled internal links returned 200.
- Correct route titles, canonical URLs, descriptions, one h1, and one main landmark were verified.
- Responses send HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP including `object-src 'none'` and `frame-ancestors 'none'`.
- HTML uses 30-second revalidation. Hashed JS/CSS use one-year immutable caching. Stable icons use short revalidation.

This is a static local-first game: it has no server-side API, payment/unlock call, sign-in, account, PWA service worker, or backend state. API allowance/429, Entra authority, concurrency, and offline-update checks are therefore not applicable.

## Game, privacy, accessibility, and responsive checks — PASS

- On the live deployment, the deterministic pointer script reached **“Course complete — you won”** (3/3 cups in 3 shots) and the five-miss-per-hole script reached **“Course over — try again”** (0/3 in 15). Restart returned to hole one while keeping best score, completed date, and sound setting.
- Live selected claim tests passed for scripted outcomes, restart reset, 60 Hz/frame-rate target, and static deployment (3/3); live accessibility/mobile/reduced-motion checks passed (4/4).
- The live 390×844/4× CPU claim passed: the runtime reports a fixed 60 Hz simulation and its 120-frame assertion remains within 55–65 fps.
- Pointer drag, touch-sized labelled controls, Arrow aim/power, Enter, R, Escape, pause, sound, clipboard fallback, storage recovery, and five-shot boundary/recovery paths are covered by the passing browser suite.
- Live request logging on a cold visit observed only same-origin GETs for the document, hashed JS/CSS, and `hero-blueprint.webp`; no cookies, third-party requests, beacons, WebSockets, EventSource, query strings, request bodies, console errors, or page errors were observed. The complete demo privacy claim also passed.
- Axe had zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, and 404. Keyboard traversal reached the skip link, navigation, demo controls, canvas, and game controls; each sampled focus stop used a visible `rgb(247, 201, 72) solid 3px` outline. Reduced-motion uses `scroll-behavior: auto`; 200% text remained usable without horizontal overflow.
- Lighthouse (fresh live desktop) reported Performance 96, Accessibility 100, Best Practices 100, SEO 92, LCP 1.3 s, TBT 220 ms, CLS 0. Lighthouse’s Chromium process crashed while gathering its final screenshot after collecting the audit data; Playwright coverage and all functional/a11y checks remained clean.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: one initial broad local `npm run test:browser` attempt produced a frame-rate-claim failure under test-suite load. The exact required claim command, an immediate direct repeat, the live frame-rate claim, and the final full 23/23 local rerun all passed. This is an observed non-repeatable test-timing flake, not a failed registered claim command, but CI reliability should be watched.

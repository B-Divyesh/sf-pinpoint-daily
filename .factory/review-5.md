# Review 5 — play a shared daily three-hole course

**Verdict: PASS**

**Implementation reviewed:** `932c4c845d8914e0d6d70a1b9b1e956c3e18e540`
**Documentation baseline:** `7475f8c82e3c86075e63a0bd0f9e078171defc09`
**Live URL:** https://pinpoint-daily.sociobot.in
**Reviewed:** 2026-09-06 UTC

There are zero findings at every severity and zero untested public claims. `932c4c8` is the last implementation commit. Every later difference through the documentation baseline is evidence, handoff, or prior review material only. The rebuilt public product files match the live release.

## First screen

Fresh live browser contexts opened `/` before scrolling.

| Check | Desktop 1440×900 | Phone 390×844 |
| --- | --- | --- |
| Job | “Play today’s three-hole course” | Same |
| Audience | “For players who want a short physics puzzle with one shared course each day.” | Same |
| First action | “Try it with sample data” | Same |
| Product visible | The game canvas begins at 717 px, so this is a game-first page rather than a menu wall. | Canvas spans 540–747 px of the initial viewport. |

The title was `Pinpoint Daily — Play a daily three-hole course`. Both fresh routes returned 200. Fresh desktop had zero console and page errors. Evidence screenshots are in `/work/.evidence/review-5-desktop-first.png` and `/work/.evidence/review-5-phone-first.png`.

## Demo and live game loop

The first action opened `/demo` with title `Demo — Pinpoint Daily`. The populated sample showed Hole 1 of 3, Shots 0 / 5, wind, the board, walls, moving bumper, prediction path, and labelled controls. Its persistent label was “Demo — sample data, saved only here”, with **Reset demo** and **Start for real**.

The exact demo-isolation command tested both `/demo` and `/?demo=1` against contradictory ordinary saved values. Demo state remained separate; Reset demo removed only its own key and returned focus to its control. The normal data was unchanged.

Two independent fresh live runs completed the actual loop:

| Run | End screen | Evidence |
| --- | --- | --- |
| Three deterministic pointer shots | “Course complete — you won”; 3 cups in 3 shots; Copy today’s result and Play again | `/work/.evidence/review-5-win.png` |
| Fifteen misses, five on each hole | “Course over — try again”; 0 of 3 cups; Copy today’s result and Play again | `/work/.evidence/review-5-loss.png` |

The passing live suite also exercised restart/reset, progress and settings persistence, result copying, keyboard aim/power/Enter/R/Escape, pointer drag, touch-sized labelled controls, pause/recovery, sound after gesture, zero-length drag, the five-shot boundary, and the loss recovery path.

## Declared claims

From this clean checkout, after `npm ci`, I invoked every exact command in `.factory/claims.json` independently. All 21 passed. The registry integrity unit test confirms one tagged browser test per claim.

| Claim IDs | Result |
| --- | --- |
| demo-isolation, demo-focus, shared-daily-course, visible-prediction, visible-course-elements, five-shot-limit, run-persistence | Pass |
| sound-setting, local-privacy, input-methods, distinct-outcomes, best-score, restart-reset, completed-date-persistence | Pass |
| clear-local-score-history, storage-removal, result-sharing, frame-rate-target, free-play, online-first-load, static-deploy | Pass |

The public landing copy, README, game, privacy page, terms, and 404 were cross-checked against the registry. No unlisted testable public promise was found. The copy audit remains clean.

## Quality, accessibility, privacy, routes, and deployment

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 60 packages, 0 vulnerabilities reported |
| `npm test` | Pass; 11/11 |
| `npm run typecheck` and `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 23/23 in 1.7m |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | Pass; 23/23 in 1.6m |
| `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo /work/.evidence/review-5-verify` | Pass; 200, title/lang/h1/main/alt/button checks and zero errors |

- The production JavaScript is 21.42 kB raw / 8.12 kB gzip and CSS is 7.62 kB raw / 2.40 kB gzip.
- The live `index.html`, 404 files, icons, robots, sitemap, WebP assets, and hashed JS/CSS exactly match the rebuilt candidate. `staticwebapp.config.json` deliberately returns 404 because it is deployment configuration, not a public artifact.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200. The unknown path returned the designed HTTP 404 with a route-specific title, heading, return link, header, and footer. This expected 404 is not a defect.
- The full live suite passed Axe checks on all public routes, keyboard focus/skip link/routing, 44px mobile targets, 200% text, reduced motion, visible focus, metadata, legal links, and no console errors.
- Live headers include self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and strict referrer policy. Request logging during complete win and loss flows passed the local-privacy allowlist: no accounts, ads, analytics, cookies, third-party requests, WebSockets, EventSource, beacons, query strings, or request bodies.
- The 390px 4×-CPU frame-rate claim passed its 55–65 fps measurement and fixed 60 Hz marker. Internet-needed first load is tested. There is no service worker, offline reload, update, backend, account, tenant, payment, health endpoint, or rate-limited API claim, so backend isolation/restart/429 and offline-update checks do not apply.

## Earlier findings

| Earlier record | Current disposition and fresh proof |
| --- | --- |
| Initial verification B-01–B-03, high/medium/low items | Closed. Current 21 exact claims and 23-test live suite cover demo isolation, mobile first screen, registry completeness, persistence, loss, headers, targets, pause, zero drag, 404, focus routing, metadata, and assets. |
| Review 1 F-1-1 through F-1-17 | Closed. Current copy audit and registered coverage retain the corrected plain wording, demo alias/focus, completed-date persistence, sharing, controls, 404, and deploy behavior. |
| Review 2 F-2-1 through F-2-14 | Closed. Prediction uses the live bumper phase; live tests prove all advertised inputs and free play, plus reset focus, legal skip link, 404 shell/wording, and consistent plain terms. |
| Verification 3 B-01/B-02 and low items | Closed. Passing claims prove a successful drag and visible walls; live mobile controls meet the target; public copy makes no unproved artwork-origin promise; fixed-name assets revalidate. |
| Verification 4 B-01–B-03 and copy-audit low item | Closed. Restart and advertised inputs are registered and passed; the generated-art claim was removed; the current copy audit includes footer text. |
| Verification 5 B-01/B-02 | Closed. The current claim proves confirmation, narrow deletion scope, permanence, and recovery for score history; demo focus is a declared claim. |
| Review 3 F-3-1 through F-3-6 | Closed. Both demo entries prove no-read/no-change isolation; privacy runs complete both outcomes; all holes compare; origin clearing, first-load connection, and cache policy are covered. |
| Verification 6 and 7 | Prior PASS remains confirmed by this clean local and live rerun. |
| Verification 8 frame-rate timing observation | Did not recur: the exact frame-rate command, final local 23/23 suite, and live 23/23 suite passed. |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested claims: 0

**Final result: PASS.**

# Review 6 — play a shared daily three-hole course

**Verdict: PASS**

**Implementation reviewed:** `932c4c845d8914e0d6d70a1b9b1e956c3e18e540`  
**Documentation baseline:** `ec76a4a6b4455787dfad07a20c242def63f54b77`  
**Live URL:** https://pinpoint-daily.sociobot.in  
**Reviewed:** 2026-09-06 UTC

There are zero findings at every severity and zero untested public claims. `932c4c8` remains the last implementation commit. Every later commit through `ec76a4a` changes review, verification, handoff, or evidence files only. A clean rebuild of that candidate matches the live release byte-for-byte for the browser-served product files.

## First screen

I opened fresh live Chromium contexts at `/` before scrolling.

| Check | Desktop 1440×900 | Phone 390×844 |
| --- | --- | --- |
| Job | “Play today’s three-hole course” | Same |
| Audience | “For players who want a short physics puzzle with one shared course each day.” | Same |
| First action | “Try it with sample data” | Same |
| Game on first screen | The canvas starts at y=717, within the 900px viewport. | The canvas spans y=540–747 of the 844px viewport. |

Both routes returned 200 with title `Pinpoint Daily — Play a daily three-hole course`. These checks answer the job, audience, and first action without scrolling. Evidence: `/work/.evidence/review-6-desktop-first.png` and `/work/.evidence/review-6-phone-first.png`.

## Demo and complete game loop

The first action opened `/demo`, titled `Demo — Pinpoint Daily`. It showed a populated sample with Hole 1 of 3, Shots 0 / 5, Cups 0 / 3, wind, walls, a moving bumper, predicted path, canvas, and labelled controls. The persistent banner read “Demo — sample data, saved only here” and included **Reset demo** and **Start for real**.

In a fresh desktop context, I seeded a contradictory ordinary-game value, entered demo, and reset it. The ordinary value was byte-for-byte unchanged; reset returned focus to its own button. The demo therefore did not read or change ordinary data.

Two fresh live runs exercised the game from entry through active play to end screens:

| Run | End screen | Evidence |
| --- | --- | --- |
| Three deterministic pointer shots | “Course complete — you won”; 3 cups in 3 shots | `/work/.evidence/review-6-win.png` |
| Fifteen misses, five per hole | “Course over — try again”; 0 of 3 cups | `/work/.evidence/review-6-loss-phone.png` |

The live suite also exercised pointer and touch-sized controls, Arrow-key aim/power, Enter, R, Escape pause/resume, zero-length drag, reset, restart, sound after gesture, persistence and recovery, sharing, loss recovery, and the five-shot boundary. The 390×844, 4× CPU-throttled frame-rate claim passed its 55–65 fps measurement and the game exposed its fixed 60 Hz simulation marker.

## Declared claims and clean checks

From a new clone at `ec76a4a`, after `npm ci`, I invoked every exact command in `.factory/claims.json` separately. All 21 passed. The output is retained at `/tmp/pinpoint-review-6-claim-local.log`.

| Claim IDs | Result |
| --- | --- |
| demo-isolation, demo-focus, shared-daily-course, visible-prediction, visible-course-elements, five-shot-limit, run-persistence | Pass |
| sound-setting, local-privacy, input-methods, distinct-outcomes, best-score, restart-reset, completed-date-persistence | Pass |
| clear-local-score-history, storage-removal, result-sharing, frame-rate-target, free-play, online-first-load, static-deploy | Pass |

The landing page, game, README, privacy page, terms, and 404 were cross-checked against the registry. No unlisted testable public promise was found. The one public first-load connection statement is covered by `online-first-load`; there is no service worker, offline-reload/update claim, backend, account, payment flow, health endpoint, tenant, or rate-limited API.

| Clean-clone command | Result |
| --- | --- |
| `npm ci` | Pass; 60 packages, 0 vulnerabilities |
| `npm test` | Pass; 11/11 |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 23/23 in 1.7m |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | Pass; 23/23 in 1.6m |

## Live quality, accessibility, privacy, and routes

- `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo /work/.evidence/review-6-verify` passed: HTTP 200, `lang=en`, one h1, main landmark, no missing image alt text or unlabelled buttons, and no errors.
- The passing live browser suite ran Axe on `/`, `/demo`, `/privacy`, `/terms`, and the 404, with zero serious or critical violations. It also verified keyboard routing/focus, skip links, 44px mobile targets, 200% text, and reduced motion.
- The privacy claim completed both win and loss flows while recording requests. It passed the same-origin static-GET allowlist and found no cookies, accounts, ads, analytics, third-party requests, query strings, request bodies, beacons, WebSockets, or EventSource usage.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 and have correct runtime route titles, metadata, canonical URLs, legal links, and one h1/main. An unknown route returned the expected HTTP 404 with the designed product page, a return link, header, and footer; this is not a defect.
- Live headers include the self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, and strict referrer policy.
- Rebuilt/live SHA-256 values match for `index.html`, hashed JS/CSS, the hero, 404 files, icons, robots, sitemap, and social card. The production JS is 21.42 kB raw / 8.12 kB gzip and CSS is 7.62 kB raw / 2.40 kB gzip.

## Earlier findings

| Earlier record | Current disposition and fresh proof |
| --- | --- |
| Initial verification B-01–B-03 and its high, medium, and low items | Closed. Fresh demo isolation/reset, first-screen mobile board, complete registry execution, persistence, loss flow, headers, targets, pause, zero-drag, 404, route focus, metadata, and assets passed. |
| Review 1 F-1-1 through F-1-17 | Closed. The current copy audit and registry retain the plain wording, demo alias/focus, completed-date persistence, result sharing, controls, legal/404 structure, and deploy behavior. |
| Review 2 F-2-1 through F-2-14 | Closed. `visible-prediction` now proves first and later moving-bumper trajectories; `input-methods` and `free-play` cover their complete advertised flows; focus, skip link, 404 wording/shell, and README terminology remain verified. |
| Verification 3 B-01/B-02 and minor items | Closed. Fresh tagged claims prove a successful drag, visible walls and bumper, public touch-target sizing, and no unsupported public artwork-origin statement. |
| Verification 4 B-01–B-03 and copy-audit minor item | Closed. Restart/reset and every advertised control are declared and tested; artwork-origin copy remains absent; the footer is included in the current copy audit. |
| Verification 5 B-01/B-02 | Closed. The destructive score-history flow has confirmation, narrow scope, permanent-removal, and recovery proof; demo focus is a declared claim and passed. |
| Review 3 F-3-1 through F-3-6 | Closed. Both demo entries are isolated; privacy completes both outcomes; all three daily holes compare; clearing storage, first-load connection, and cache/deploy behavior are covered. |
| Verifications 6 and 7 | No findings to reopen. Their outcomes are independently reproduced by this clean local and live run. |
| Verification 8 frame-rate timing observation | Did not recur: the exact frame-rate command, clean 23/23 local suite, and live 23/23 suite passed. |
| Reviews 4 and 5 | No findings to reopen. Their candidate and live assertions were independently reproduced above. |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested claims: 0

**Final result: PASS.**

# Verify daily browser-game play — review 4

**Verdict: PASS**

**Reviewed implementation:** `531e5b28e1023382710e7a3ce8a6458db6854358`
**Documentation baseline:** `53d6d7754f337e19d44c8ed51163779801a742f3`
**Live URL:** https://pinpoint-daily.sociobot.in
**Reviewed:** 2026-09-05 UTC

There are zero current findings at every severity and zero untested public claims. The documentation commit is later than the implementation candidate; it records verification only, so the live product comparison uses `531e5b2`.

## First screen

Fresh desktop and phone browser contexts opened the live site without scrolling.

| Check | Desktop 1440×900 | Phone 390×844 |
|---|---|---|
| Job | “Play today’s three-hole course” | Same heading |
| Audience | “For players who want a short physics puzzle with one shared course each day.” | Same sentence |
| First action | “Try it with sample data” | Same action |
| Product visible | Canvas begins at 717 px; the first screen is the game page, not a menu | Demo canvas spans 633–840 px and is visible in the initial viewport |

The live document title was `Pinpoint Daily — Play a daily three-hole course`. The desktop visit returned 200 with no console or page errors.

## Demo and game run

The first action opened `/demo` and changed the title to `Demo — Pinpoint Daily`. The persistent label was “Demo — sample data, saved only here,” with **Reset demo** and **Start for real**. The populated sample showed Hole 1 of 3, Shots 0 / 5, wind, the board, walls, bumper, cup, prediction path, and controls.

In a fresh phone context, I seeded an ordinary-game storage value, entered the demo, changed a demo setting, and reset the demo. The ordinary value stayed byte-for-byte unchanged; the demo key was absent after reset; focus returned to Reset demo. This independently confirms the sample is isolated and resettable.

Two fresh live contexts completed deterministic runs:

| Run | End-screen evidence | Result |
|---|---|---|
| Three scripted pointer shots | “Course complete — you won”; result-copy control present | Win |
| Fifteen misses, five per hole | “Course over — try again”; result-copy control present | Loss |

The first standalone win script failed only because the reviewer script sent coordinates to an off-screen canvas. The product’s documented flow scrolls the canvas into view; after adding that standard step, the same live run completed. This is reviewer-script setup, not a product finding.

## Claims

After `npm ci` in this clean checkout, I invoked every exact command in `.factory/claims.json` independently. All 21 passed through the production-style demo entry point. The final Playwright run record reports `status: passed` and no failed tests.

| Claim IDs | Result |
|---|---|
| demo-isolation, demo-focus, shared-daily-course, visible-prediction, visible-course-elements, five-shot-limit, run-persistence | Pass |
| sound-setting, local-privacy, input-methods, distinct-outcomes, best-score, restart-reset, completed-date-persistence | Pass |
| clear-local-score-history, storage-removal, result-sharing, frame-rate-target, free-play, online-first-load, static-deploy | Pass |

Registry integrity is covered by the unit suite: every registered ID maps to exactly one tagged test. No additional claim-like public copy was found outside the registry; the current copy audit records no sentence over 22 words or banned marketing wording.

## Local checks

| Command | Result |
|---|---|
| `npm ci` | Pass; 60 packages, no vulnerabilities reported |
| `npm test` | Pass; 11/11 |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 23/23 |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | Pass; 23/23 |
| `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo <temporary evidence dir>` | Pass; 200, no errors, title/lang/h1/main/alt/button checks passed |

The fresh build has 21.42 kB raw / 8.12 kB gzip JavaScript and 7.62 kB raw / 2.40 kB gzip CSS. It is within the stated static-game budgets.

## Live site checks

- The 11 browser-served build artifacts matched rebuilt `dist/` byte-for-byte: HTML, 404 files, icons, robots, sitemap, both WebP files, and hashed JS/CSS. `staticwebapp.config.json` correctly returns 404 because it is deployment configuration, not a public artifact.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown address returned the designed HTTP 404, which is expected and not a defect.
- Titles, one h1, main landmark, canonical and social metadata, legal pages, links, focus routing, headers, and 404 structure passed the live browser suite.
- Live responses include self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and strict referrer policy. The privacy flow recorded only same-origin static/document GET requests, no cookies, accounts, ads, analytics, WebSockets, EventSource, query strings, request bodies, or third-party requests.
- The live suite exercised pointer, touch-sized controls, Arrow keys, Enter, R, Escape, pause, sound, persistence, storage recovery, result sharing, five-shot boundary recovery, restart, 390×844 layout, 4×-CPU 55–65 fps measurement, reduced motion, 200% text, keyboard focus, and Axe on all public routes. It passed.
- There is no backend, account, payment, service worker, offline-update promise, tenant, health, or rate-limited API in this static local-first product. Backend isolation, restart, 429/Retry-After, and update checks do not apply.

## Earlier findings

| Earlier record | Current disposition and proof |
|---|---|
| Initial verification B-01–B-03; high, medium, and low issues | Closed. Demo isolation, initial mobile board, complete registry, persistence, loss, headers, targets, pause, zero-drag, 404, route focus, metadata, and assets are covered by the current 21 claims and 23-test live suite. |
| Review 1 F-1-1 through F-1-17 | Closed. Unsupported copy was removed or rewritten; complete-date, demo alias/focus, result sharing, controls, 404, copy audit, and deploy behavior remain covered. |
| Review 2 F-2-1 through F-2-14 | Closed. The preview uses the live simulation phase; full input and free-play flows are tested; focus, legal skip link, 404 wording/shell, and plain copy remain verified. |
| Verification 3 B-01/B-02 and low items | Closed. Successful drag and wall proof are in tagged tests; all public touch targets meet the requirement; no public generated-art claim remains; only hashed assets are immutable. |
| Verification 4 B-01–B-03 and copy-audit low item | Closed. Restart, full advertised input, and no-unproved-provenance coverage are registered; the current copy audit includes the footer. |
| Verification 5 B-01/B-02 | Closed. The destructive score-history control has confirmation, narrow scope, permanence and recovery coverage; demo focus is a registered claim. |
| Review 3 F-3-1 through F-3-6 | Closed. Both demo entries prove no-read/no-change isolation; privacy checks complete win/loss flows; all three shared holes compare; origin storage clearing, no-undo wording, first-load connection, and cache policy are tested. |
| Verification 6 and 7 | Both were PASS records; current clean and live reruns preserve their results. |
| Verification 8 low frame-rate timing observation | Did not recur. This review’s direct frame-rate claim, final full local suite, and full live suite all passed. It is not a current finding. |

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested claims: 0

**Final result: PASS.**

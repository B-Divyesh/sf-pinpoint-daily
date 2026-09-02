# Perfection loop 3 — finding closure

- Date: 2026-09-02 UTC
- Implementation commit: `932c4c8`
- Deployment ID: `c0c9df7f-8840-4756-ae98-e3fe28b75b72`
- Live URL: `https://pinpoint-daily.sociobot.in`

All findings in reviews 1, 2, and 3 are closed. The evidence below was produced after the round-3 deployment.

## Review 3

| Finding | Change made | Evidence |
|---|---|---|
| F-3-1 / B-03 | Expanded `demo-isolation` to the full no-read/no-change promise. The test seeds contradictory ordinary run, best, completed-date, and sound values, then checks independent defaults and unchanged ordinary storage through both demo entries. | `@claim:demo-isolation both demo entries ignore and preserve ordinary game data`; [isolated demo screenshot](evidence/polish-3-live/qa/isolated-demo-mobile.png); live `/demo` and `/?demo=1`; live suite 23/23. |
| F-3-2 | Rebuilt `local-privacy` around complete win and loss flows. It rejects account/ad UI, beacons, WebSockets, EventSource, cookies, bodies, query strings, non-GETs, and every request outside the exact document/static-asset allowlist. | `@claim:local-privacy complete win and loss flows stay local without accounts, ads, or analytics`; [win](evidence/polish-3-live/qa/win-end.png), [loss](evidence/polish-3-live/qa/loss-end.png); live `/demo`. |
| F-3-3 | The shared-course test now advances two fixed-clock contexts identically through holes 1, 2, and 3, compares each rendered board, reloads each stage, and compares again. | `@claim:shared-daily-course fresh demo contexts render the same three-hole sample`; [hole 1](evidence/polish-3-live/qa/shared-hole-1.png), [hole 2](evidence/polish-3-live/qa/shared-hole-2.png), [hole 3](evidence/polish-3-live/qa/shared-hole-3.png); live `/demo` → `/`. |
| F-3-4 / B-03 | Added `storage-removal` for full ordinary/demo origin clearing. Extended score-history coverage to assert the no-undo warning, no Undo control, permanent removal after reload, and preservation of run/sound only. | `@claim:storage-removal`; `@claim:clear-local-score-history`; [privacy screenshot](evidence/polish-3-live/qa/privacy.png); live `/privacy` and `/demo`. |
| F-3-5 | Replaced the game-rule fact with the honest first-screen fact “Internet needed to open,” documented the limitation in README, and added a fresh offline-context test. | `@claim:online-first-load a fresh first load needs an internet connection`; [cold home at 390×844](evidence/polish-3-live/qa/cold-home-mobile.png); live `/`. |
| F-3-6 | Removed the stable `/*.svg` immutable route from both configs. The config test now rejects every immutable route except `/assets/*`; the live test checks both icon headers. | `static deployment policy > sets immutable caching only for hashed build assets`; `@claim:static-deploy`; [live QA record](evidence/polish-3-live/qa/qa.json); live `/favicon.svg` and `/apple-touch-icon.svg` return `public, must-revalidate, max-age=30`. |

## Review 2 recheck

| Finding | Preserved change | Current evidence |
|---|---|---|
| F-2-1 | Prediction still starts from the live simulation snapshot and bumper phase. | `@claim:visible-prediction`; live `/demo`; live suite 23/23. |
| F-2-2 | Both keyboard directions and every labelled aim, power, shoot, and reset control remain exercised. | `@claim:input-methods`; [demo screenshot](evidence/polish-3-live/qa/isolated-demo-mobile.png); live `/demo`. |
| F-2-3 | Free play still completes all three holes without an account or payment gate. | `@claim:free-play`; [win result](evidence/polish-3-live/qa/win-end.png); live `/demo`. |
| F-2-4 | The unsupported no-sound promise remains absent. | Copy audit; live `/demo`; full live copy checked with zero console errors. |
| F-2-5 | The unprovable public generated-artwork claim remains absent; provenance stays internal. | Claims registry integrity; live `/`, `/demo`, `/privacy`, `/terms`. |
| F-2-6 | Reset demo restores focus and announces “Demo reset.” | `@claim:demo-isolation`; live `/demo`; [demo screenshot](evidence/polish-3-live/qa/isolated-demo-mobile.png). |
| F-2-7 | Every page keeps “Skip to main content.” | `@claim:static-deploy`; live `/privacy` and `/terms`. |
| F-2-8 | 404 label remains “PAGE NOT FOUND · 404.” | `@claim:static-deploy`; [404 screenshot](evidence/polish-3-live/qa/not-found.png); live unknown URL returns 404. |
| F-2-9 | Both 404 implementations use “This page does not exist.” | `@claim:static-deploy`; [404 screenshot](evidence/polish-3-live/qa/not-found.png); live unknown URL. |
| F-2-10 | 404 header retains Demo, How it works, and Privacy. | `@claim:static-deploy`; [404 screenshot](evidence/polish-3-live/qa/not-found.png); live unknown URL. |
| F-2-11 | README consistently calls the audience “players.” | Copy audit; README in `932c4c8`; cold live `/`. |
| F-2-12 | README continues to say the UTC date chooses the course. | Copy audit; `@claim:shared-daily-course`; live `/`. |
| F-2-13 | README keeps the plain 60-updates-per-second wording. | `@claim:frame-rate-target`; measured live 60.003 fps under 4× CPU throttle. |
| F-2-14 | Public storage terminology remains “browser storage.” | Copy audit; `@claim:demo-isolation`; live `/privacy`. |

## Review 1 recheck

| Finding | Preserved change | Current evidence |
|---|---|---|
| F-1-1 | “Fair” remains removed; the measurable shared-course wording remains. | `@claim:shared-daily-course`; three live hole screenshots; live `/`. |
| F-1-2 | The unsupported public-leaderboard statement remains absent. | `@claim:local-privacy`; live `/`. |
| F-1-3 | The query-string demo entry is in the isolation regression. | `@claim:demo-isolation`; live `/?demo=1`. |
| F-1-4 | The README coverage boast remains absent and tag integrity enforces one tag per claim. | `claims registry > maps every registered claim to exactly one test tag`; unit suite 11/11. |
| F-1-5 | The static build claim remains backed by a production build. | `@claim:static-deploy`; clean-clone build; live deployment. |
| F-1-6 | Deep routes and response security headers are exercised through the SWA emulator and live host. | `@claim:static-deploy`; live `/demo`, `/privacy`, `/terms`. |
| F-1-7 | The unprovable public originality sentence remains absent. | Copy audit; live footer. |
| F-1-8 | Terms remains limited to the proved “free to play” statement. | `@claim:free-play`; live `/terms`. |
| F-1-9 | Completed dates are saved and restored after a deterministic win. | `@claim:completed-date-persistence`; [win result](evidence/polish-3-live/qa/win-end.png); live `/demo`. |
| F-1-10 | 404 retains the complete site shell, metadata, icons, legal links, and HTTP 404 response. | `@claim:static-deploy`; [404 screenshot](evidence/polish-3-live/qa/not-found.png); live unknown URL. |
| F-1-11 | Demo action remains “Play the sample course” and focuses the course heading. | `@claim:demo-focus`; [demo screenshot](evidence/polish-3-live/qa/isolated-demo-mobile.png); live `/demo`. |
| F-1-12 | All audited copy stays at 22 words or fewer. | `.factory/copy-audit.md`; cold live `/`, `/privacy`, `/terms`. |
| F-1-13 | Control remains “Decrease power.” | `@claim:input-methods`; live `/demo`. |
| F-1-14 | Control remains “Increase power.” | `@claim:input-methods`; live `/demo`. |
| F-1-15 | Sound control keeps action labels and `aria-pressed`. | `@claim:sound-setting`; live `/demo`. |
| F-1-16 | The isolated mode remains consistently named “demo.” | Copy audit and `.factory/demo.md`; live `/demo`. |
| F-1-17 | Both end states copy non-spoiling date, cups, and shots, with fallback text. | `@claim:result-sharing`; [win](evidence/polish-3-live/qa/win-end.png), [loss](evidence/polish-3-live/qa/loss-end.png); live `/demo`. |

## Carried verification findings

| Finding | Current result and evidence |
|---|---|
| B-01 | Fixed: demo reads and writes only `demo:daily-v1`; `@claim:demo-isolation`; live QA JSON. |
| B-02 | Fixed: the 390×844 cold home and demo both show the playable canvas; mobile screenshots and first-screen browser test. |
| B-03 | Fixed: 21 registry entries map to exactly one tag; all 21 commands passed independently in the clean clone. |
| H-01 | Fixed: current run reloads; `@claim:run-persistence`; live suite. |
| H-02 | Fixed: sound gesture and saved setting pass; `@claim:sound-setting`; live suite. |
| H-03 | Fixed: deterministic win and loss remain distinct; `@claim:distinct-outcomes`; live end screenshots. |
| H-04 | Fixed: live CSP contains `frame-ancestors 'none'`; `@claim:static-deploy`; verify-url has zero console errors. |
| M-01 | Fixed: banner accurately says sample data is saved only in the demo; isolated-demo screenshot. |
| M-02 | Fixed: every public page retains 44 px targets at 390×844; full live suite. |
| M-03 | Fixed: pause blocks shots; `@claim:input-methods`; live suite. |
| M-04 | Fixed: zero-length drag does not consume a shot; `@claim:input-methods`; live suite. |
| M-05 | Fixed: hashed `/assets/*` is immutable; all fixed filenames revalidate; config unit and live icon checks. |
| M-06 | Fixed: unknown address returns the designed HTTP 404; `@claim:static-deploy`; 404 screenshot. |
| M-07 | Fixed: route changes and Back focus the new H1 and announce it; `@claim:static-deploy`; live suite. |
| L-01 | Fixed: every public route and 404 has route-specific title, description, canonical, Open Graph, and Twitter metadata; `@claim:static-deploy`. |
| L-02 | Fixed: the deployed social card remains 1200×630 and matches the build; production hash comparison. |

## Final verification

- Clean clone: `/tmp/pinpoint-polish3-clean-mXHa4Q/repo` at `932c4c8`.
- Every exact claim command: 21/21 passed independently after `npm ci`.
- Clean unit/config: 11/11; lint/typecheck/build passed; full browser suite: 23/23.
- Live browser suite: 23/23, including Axe serious/critical checks, privacy, offline, mobile, routes, win, loss, and both restarts.
- Local and live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Live LCP 1.2 s, TBT 10 ms, CLS 0.
- Live verify-url: 618 ms, no console/page errors, one H1, `lang=en`, main landmark, image alt, and labelled buttons.
- Live 4× CPU measurement: 120 frames in 1999.9 ms, 60.003 fps; simulation marker 60 Hz.
- Eleven deployed public artifacts match `dist/` byte-for-byte. Routes `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns 404.

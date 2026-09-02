# Adversarial first-read review 2 — Pinpoint Daily

Date: 2026-09-02 UTC

Candidate: `d38065687f36944e7e133b50a47179f072ce1c23`

Live site: `https://pinpoint-daily.sociobot.in`

## Verdict: FAIL

The cold first screen, one-click demo, storage isolation, build, automated suites, valid-route metadata, routing, and baseline accessibility checks pass. The product still fails this review because five blocking and nine minor findings remain. In particular, the dotted path can show the wrong route after an earlier shot, three registered claim tests do not prove their full promise, and one product-behaviour claim is absent from the claim registry.

- Blocking findings: 5
- Minor findings: 9
- Registered claim commands run: 20 of 20; all commands exited successfully
- Claims independently found false, incompletely tested, or unlisted: 5

## Cold first read

I opened `/` without stored state in separate 390×844 and 1440×900 Chromium contexts and did not scroll.

| View | What does it do? | For whom? | What should I click first? | Result |
|---|---|---|---|---|
| 390×844 | A shared three-hole tabletop golf physics puzzle that changes each day. | Players who want a short physics puzzle. | **Try it with sample data**; the next line says it opens a demo course in separate storage. | Pass |
| 1440×900 | The same daily three-hole physics game, with a visible predicted path and live board. | Players who want a short shared daily puzzle. | **Try it with sample data**. | Pass |

Exact first-screen copy was **“Play today’s three-hole course”**, **“For players who want a short physics puzzle with one shared course each day”**, and **“Try it with sample data”**. On mobile, the h1 began at y=98, the action at y=264, and the complete canvas occupied y=540–747. On desktop, the h1 began at y=132 and the course canvas began at y=717. All three questions are answerable before scrolling, so the first-read gate passes.

## Findings

### Blocking

#### F-2-1 — the dotted path can predict the wrong bounce

- Quote/location: landing and README, **“The dotted path previews bounces before release”** / **“The dotted path previews bounces before you shoot.”** Implementation: `src/main.ts:461`, `src/game.ts:82-87`. Registered test: `tests/app.e2e.ts:87-103`.
- Why this fails: the live simulation keeps elapsed time after a shot or hole reset, so the moving bumper keeps its current phase. `predictedPoints` creates a new simulation at elapsed time zero. After one shot and reset on the sample first hole, an aim of −63° at power 180 produced a maximum 449.64-pixel difference between the preview simulation and the real shot simulation. The registered test only counts cyan pixels before and after Pause; it never compares the path with the shot.
- Concrete fix: build the preview from the current simulation snapshot, including elapsed time and bumper phase. Add a `@claim:visible-prediction` assertion that samples preview points and actual ball positions for both the first shot and a later shot after a reset, including a bumper collision.

#### F-2-2 — the input-methods claim is not fully tested

- Quote/location: `.factory/claims.json`, **“The game supports drag, labelled controls, Arrow-key aim and power, Enter to shoot, R to reset, and Escape to pause.”** Registered test: `tests/app.e2e.ts:251-288`.
- Why this fails: the test presses ArrowRight but never ArrowLeft. It clicks Decrease power, Shoot, and Reset hole, but it does not operate the labelled Aim left, Aim right, or Increase power controls. A passing tag does not prove every advertised input method.
- Concrete fix: exercise ArrowLeft and ArrowRight and assert the saved angle changes in both directions. Activate every labelled aim/power/shoot/reset control and assert its state change. Keep drag, Enter, R, Escape, and zero-length drag coverage in the same tagged test.

#### F-2-3 — the “complete game is free” test checks only the first screen

- Quote/location: `.factory/claims.json` and README, **“The complete game is free to play without an account or payment step.”** Registered test: `tests/app.e2e.ts:410-415`.
- Why this fails: the test opens `/demo`, sees Shoot, and searches the initial DOM for sign-in or payment text. It does not complete all three holes or check the intermediate and result screens, so it cannot detect a later account or payment gate.
- Concrete fix: finish the deterministic three-hole run in `@claim:free-play`, checking after each hole and on the result screen that play remains available with no sign-in, subscription, purchase, or payment control.

#### F-2-4 / B-03 recurrence — the no-sound fallback is an unlisted claim

- Quote/location: `src/main.ts:264`, **“The game still works without it.”** This appears after Web Audio fails.
- Why this fails: it is a product-behaviour promise that is absent from `.factory/claims.json`. The `sound-setting` test supplies a working fake AudioContext and never enters this failure path. This reopens the earlier incomplete-registry finding `B-03` recorded in review 1.
- Concrete fix: add a `sound-fallback` claim and test with an AudioContext constructor/resume failure, then take a shot and complete a state transition. Alternatively, replace the sentence with a direct recovery instruction that makes no untested promise, such as **“Turn sound off and keep playing.”**

#### F-2-5 / F-1-7 recurrence — the generated-artwork test is circular

- Quote/location: footer on every route, **“Blueprint artwork is generated for Pinpoint Daily.”** Registered test: `tests/app.e2e.ts:445-458`.
- Why this fails: the test confirms that the sentence is displayed, hashes the served image against the same repository image, and checks that `.factory/design.md` repeats the provenance statement. None of those assertions proves that the image was generated for this product. The recorded generator metadata in `assets/src/hero-blueprint.png.json` is not checked. This is a half-fix of review 1 finding `F-1-7`.
- Concrete fix: remove the public provenance sentence and keep provenance in `.factory/design.md`; or validate the checked-in generation receipt, prompt, source-image hash, derived WebP hash, and dimensions in a build-time provenance test. The test must not use the claim sentence itself as evidence.

### Minor

#### F-2-6 — Reset demo drops keyboard focus

- Quote/location: `/demo`, **“Reset demo”**; `src/main.ts:149-154`.
- Why this matters: activating Reset replaces the whole page shell. The focused button disappears and `document.activeElement` becomes `<body>`, with no reset confirmation. A keyboard user must restart navigation from the page beginning.
- Concrete fix: after rerendering, focus the new Reset demo button or the demo h1 and announce **“Demo reset.”** Add this to `@claim:demo-isolation`.

#### F-2-7 — the skip link is wrong on legal pages

- Quote/location: `/privacy` and `/terms`, **“Skip to game”**; `src/main.ts:77`.
- Why this matters: those routes contain policy content, not a game. The label misstates the result of the link.
- Concrete rewrite: use **“Skip to main content”** on every SPA route, matching the designed 404.

#### F-2-8 — the 404 eyebrow is decorative metaphor

- Quote/location: `public/404.html:33`, **“404 · OFF THE DRAWING.”**
- Why this matters: “off the drawing” carries no actionable information and depends on the blueprint metaphor. The plain-words rule excludes mood labels and brand lore.
- Concrete rewrite: **“PAGE NOT FOUND · 404.”**

#### F-2-9 — the 404 h1 uses a course metaphor

- Quote/location: `public/404.html:34`, **“This page is not on today’s course.”** The client-side fallback also says **“This course does not exist”** at `src/main.ts:116`.
- Why this matters: a visitor needs to translate the game metaphor to understand a routing error.
- Concrete rewrite: use **“This page does not exist”** in both 404 implementations.

#### F-2-10 — the 404 header is not consistent with the product routes

- Location: `public/404.html:29` compared with `src/main.ts:80`.
- Why this matters: the normal header contains Demo, How it works, and Privacy. The 404 drops How it works, contrary to the required consistent shell.
- Concrete fix: add **How it works** linking to `/#how`, then include the 404 in the header-consistency test.

#### F-2-11 — README uses an awkward, inconsistent audience term

- Quote/location: README line 3, **“It is for web-game players who want a short physics puzzle.”**
- Why this matters: the landing page says “players”; “web-game players” is awkward and adds a second term for the same audience.
- Concrete rewrite: **“It is for players who want a short browser physics puzzle.”**

#### F-2-12 — “UTC daily seed” is unexplained implementation jargon

- Quote/location: README line 5, **“The course uses a UTC daily seed…”**
- Why this matters: a reader should not need to understand seeded random generation to know when the course changes.
- Concrete rewrite: **“The UTC date chooses the daily course.”**

#### F-2-13 — “fixed 60 Hz physics” is unexplained implementation jargon

- Quote/location: README line 5, **“…fixed 60 Hz physics…”**
- Why this matters: “Hz” describes the implementation, not the reader-visible result.
- Concrete rewrite: **“Physics updates 60 times each second.”** Keep the quantitative claim test.

#### F-2-14 — README switches from “browser storage” to `localStorage`

- Quote/location: README line 33, **“The demo uses a separate localStorage key…”**
- Why this matters: the document otherwise says “browser storage,” and a first-time reader does not need the API name.
- Concrete rewrite: **“The demo uses separate browser storage and never reads or changes ordinary game data.”** Keep the exact key names in `.factory/demo.md`.

## Copy audit

Counts are whitespace-delimited. Code blocks are commands, not sentences. Headings, labels, accessible names, alt text, controls, conditional errors, statuses, and result copy are included because all can be encountered on the landing/game route. No item exceeds 22 words and no banned marketing adjective appears.

### Landing, demo, and game copy

| Copy | Words | Result |
|---|---:|---|
| Skip to game | 3 | F-2-7 on legal routes; clear on the game route |
| PINPOINT DAILY | 2 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| TODAY’S SHARED COURSE · WED 2 SEPT | 7 | Pass; date varies |
| SAMPLE COURSE · 1 SEP 2026 | 6 | Pass |
| Demo — sample data, saved only here | 7 | Pass |
| Reset demo | 2 | Copy passes; focus fails in F-2-6 |
| Start for real | 3 | Pass; required demo exit label |
| Play today’s three-hole course | 4 | Pass |
| For players who want a short physics puzzle with one shared course each day. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a demo course in separate storage. | 7 | Pass |
| Play the sample course | 4 | Pass |
| Moves focus to the demo course. | 6 | Pass |
| Free to play | 3 | Claim-test gap F-2-3 |
| Five shots per hole | 4 | Pass |
| Scores stay on this device | 5 | Pass |
| A tabletop golf course drawn on a navy blueprint sheet. | 10 | Pass |
| LIVE COURSE | 2 | Pass |
| Aim, check the dotted path, then shoot | 7 | Claim failure F-2-1 |
| Drag away from the ball to set aim and power. | 10 | Pass |
| Interactive tabletop golf course | 4 | Pass |
| Hole 1 of 3 | 4 | Pass; values vary |
| Shots: 0 / 5 | 4 | Pass; values vary |
| Cups: 0 / 3 | 4 | Pass; values vary |
| No wind | 2 | Pass |
| Wind → light / Wind ← light | 3 each | Pass |
| Pause / Resume | 1 each | Pass |
| Aim left / Aim right | 2 each | Claim-test gap F-2-2 |
| Decrease power / Increase power | 2 each | Claim-test gap F-2-2 |
| Shoot | 1 | Pass |
| Reset hole | 2 | Pass |
| Turn sound on / Turn sound off | 3 each | Pass |
| Drag from the ball, or use arrow keys and Enter. | 10 | Claim-test gap F-2-2 |
| Clear local score history | 4 | Pass |
| Clear saved score history? | 4 | Pass |
| This deletes the best score and completed dates for this demo. | 11 | Pass |
| This deletes the best score and completed dates for this game. | 11 | Pass |
| It keeps your current run and sound setting. | 8 | Pass |
| This cannot be undone. | 4 | Pass |
| Keep saved data | 3 | Pass |
| Clear best score and completed dates | 6 | Pass |
| Sound could not start in this browser. | 7 | Pass |
| The game still works without it. | 6 | Unlisted claim F-2-4 |
| Ball rolling. | 2 | Pass |
| Watch the bounce. | 3 | Pass |
| Hole reset. | 2 | Pass |
| Your used shots remain counted. | 5 | Pass |
| Game paused. / Game resumed. | 2 each | Pass |
| Power set to 105. | 4 | Pass; value varies |
| Saved score history cleared. | 4 | Pass |
| Your current run and sound setting remain. | 7 | Pass |
| Course complete — you won | 5 | Pass |
| You sank all three cups in 3 shots. | 8 | Pass; value varies |
| That is your local best. | 5 | Pass |
| Local best: 3 shots. | 4 | Pass; value varies |
| Course over — try again | 5 | Pass |
| You sank 0 of 3 cups. | 6 | Pass; value varies |
| Sink every cup to win. | 5 | Pass |
| Copy today’s result | 3 | Pass |
| Play again | 2 | Pass |
| Copy this result | 3 | Pass |
| Today’s result copied. | 3 | Pass |
| Copy the selected result above. | 5 | Pass |
| Pinpoint Daily 2026-09-01 — 3/3 cups in 3 shots | 9 | Pass; values vary |
| New run. | 2 | Pass |
| Read the path before shooting. | 5 | Pass |
| In the cup. | 3 | Pass |
| Next hole. | 2 | Pass |
| Five shots used. | 3 | Pass |
| That hole was lost. | 4 | Pass |
| Finished run restored. | 3 | Pass |
| Run restored at hole 2. | 5 | Pass; value varies |
| Play today’s three-hole course page loaded | 6 | Pass; route announcement |
| HOW IT WORKS | 3 | Pass |
| Play the daily course in three steps | 7 | Pass |
| Read the board. | 3 | Pass |
| Wind, walls, and the moving bumper are visible. | 8 | Pass |
| Drag a shot. | 3 | Pass |
| The dotted path previews bounces before release. | 7 | Claim failure F-2-1 |
| Finish three holes. | 3 | Pass |
| Sink every cup to win. | 5 | Pass |
| Five missed shots lose a hole. | 6 | Pass |
| What this game does not do | 6 | Pass |
| It has no accounts, ads, or analytics. | 7 | Pass |
| Game data stays in your browser. | 6 | Pass |
| Play one shared tabletop course each day. | 7 | Pass |
| Terms | 1 | Pass |
| Blueprint artwork is generated for Pinpoint Daily. | 7 | Claim failure F-2-5 |
| Built by Param Factory · build 1.2.2 | 7 | Pass |

### README copy

| Copy | Words | Result |
|---|---:|---|
| Pinpoint Daily | 2 | Pass |
| Play one shared three-hole tabletop golf course each day. | 9 | Pass |
| It is for web-game players who want a short physics puzzle. | 11 | F-2-11 |
| Drag to aim and power a shot. | 7 | Pass |
| The dotted path previews bounces before you shoot. | 8 | Claim failure F-2-1 |
| The course uses a UTC daily seed, fixed 60 Hz physics, five shots per hole, visible wind, and one moving bumper. | 21 | F-2-12, F-2-13 |
| Sink every cup to win; a missed hole produces a separate loss screen. | 13 | Pass |
| Copy the date, cups, and shots from either result screen. | 10 | Pass |
| The game targets 60 rendered frames per second on a mid-range phone. | 12 | Pass |
| The full game is free. | 5 | Claim-test gap F-2-3 |
| Your current run, completed dates, best score, and sound preference stay in browser storage. | 14 | Pass |
| There are no accounts, ads, analytics, cookies, or third-party game requests. | 11 | Pass |
| Run it | 2 | Pass |
| Open `http://localhost:5173/`. | 2 | Pass |
| The one-click demo is `/demo` or `/?demo=1`. | 7 | Pass |
| Verify it | 2 | Pass |
| Play controls | 2 | Pass |
| Drag away from the ball, then release to shoot. | 9 | Pass |
| Arrow keys set aim and power. | 6 | Claim-test gap F-2-2 |
| Enter shoots. | 2 | Pass |
| R resets the current hole. | 5 | Pass |
| Escape pauses or resumes. | 4 | Pass |
| Touch players can drag or use the labelled on-screen controls. | 10 | Claim-test gap F-2-2 |
| A run has three holes. | 5 | Pass |
| Progress, completed dates, best score, and sound preference persist locally. | 10 | Pass |
| The demo uses a separate localStorage key and never reads or changes ordinary game data. | 15 | F-2-14 |
| Deploy | 1 | Pass |
| `npm run build` creates `dist/` with static files, route rewrites, and security headers. | 13 | Pass |
| Upload the contents of `dist/` to the static host. | 9 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass; verified against `LICENSE` |
| See `LICENSE`. | 2 | Pass |

### Terminology

| Concept | Preferred term | Observed alternatives | Result |
|---|---|---|---|
| Audience | players | web-game players, Touch players | F-2-11 for the awkward README form; “Touch players” describes an input group |
| Day-specific set | course | shared course, daily course, tabletop course | Pass; modifiers are useful |
| One challenge | hole | none | Pass |
| Shot preview | dotted path | path | Pass |
| Isolated sample mode | demo | sample data only in the required entry action/banner | Pass |
| Device persistence | browser storage | localStorage | F-2-14 |
| Moving obstacle | bumper | none | Pass |

## Demo and sandbox behaviour

The landing action was selected after seeding `pinpoint:daily-v1` with `{"best":9,"completed":["20260831"],"sound":false}`.

| Check | Result | Evidence |
|---|---:|---|
| One click enters demo | Pass | `/` became `/demo`; title became `Demo — Pinpoint Daily` |
| Product already visible after click | Pass | At 390×844, course heading began at y=508 and canvas occupied y=633–840 |
| Realistic sample | Pass | Fixed three-hole seed `20260901`, visible walls, wind, moving bumper, cup, score, controls, and predicted path |
| Persistent banner | Pass | Demo banner, Reset demo, and Start for real remained present |
| Separate namespace | Pass | Sound interaction wrote `demo:daily-v1`; seeded `pinpoint:daily-v1` remained byte-for-byte unchanged |
| Reset | Functional pass; focus finding | Reset removed only `demo:daily-v1`; F-2-6 records lost focus and absent confirmation |
| Start for real | Pass | Demo key was deleted, ordinary key preserved, URL became `/` |
| Direct `/demo` and `/?demo=1` | Pass | Both use sample seed and demo namespace; the registered isolation test covers both |
| Request log | Pass | Only the product origin was requested; no cookies were created |
| Offline | Not claimed | No service worker or offline promise applies |

## Claims

Every exact command from `.factory/claims.json` was run separately after `npm ci` in the clean clone `/tmp/pinpoint-review2-z6aoJX/repo`. All 20 commands exited successfully. The table distinguishes command success from whether the assertion proves the public claim.

| Claim | Command | Review result |
|---|---:|---|
| `demo-isolation` | Pass | Pass |
| `demo-focus` | Pass | Pass |
| `shared-daily-course` | Pass | Pass |
| `visible-prediction` | Pass | **Fail — F-2-1; cyan pixels do not prove prediction and the later-shot preview diverges** |
| `visible-course-elements` | Pass | Pass |
| `five-shot-limit` | Pass | Pass |
| `run-persistence` | Pass | Pass |
| `sound-setting` | Pass | Pass; separate unlisted error fallback in F-2-4 |
| `local-privacy` | Pass | Pass |
| `input-methods` | Pass | **Untested in full — F-2-2** |
| `distinct-outcomes` | Pass | Pass |
| `best-score` | Pass | Pass |
| `restart-reset` | Pass | Pass |
| `completed-date-persistence` | Pass | Pass |
| `clear-local-score-history` | Pass | Pass |
| `result-sharing` | Pass | Pass |
| `frame-rate-target` | Pass | Pass; 55–65 fps bound asserted under 4× CPU throttling at 390×844 |
| `free-play` | Pass | **Untested in full — F-2-3** |
| `generated-artwork` | Pass | **Untested provenance — F-2-5** |
| `static-deploy` | Pass | Pass |

The unlisted product-behaviour sentence is recorded separately as F-2-4. No other live/README feature or privacy promise lacked a corresponding registry entry.

## Earlier findings rechecked

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the prior `.factory/handoff.md`, then checked each review finding on the live site and in source.

| Earlier ID | Current result | Evidence |
|---|---:|---|
| F-1-1 | Fixed | “fair” is gone; shared daily course test passes |
| F-1-2 | Fixed | Public-leaderboard statement is gone |
| F-1-3 | Fixed | `/?demo=1` is in `@claim:demo-isolation` and passed |
| F-1-4 | Fixed | Coverage sentence removed; registry-integrity unit test passes |
| F-1-5 | Fixed | `static-deploy` claim builds and serves static output |
| F-1-6 | Fixed | Deep route and security-header checks passed |
| F-1-7 | **Half-fixed / blocking** | Narrower generated-artwork claim remains circular; F-2-5 reopens it |
| F-1-8 | Fixed | Terms now says “free to play” |
| F-1-9 | Fixed | Completed date is asserted after win and reload |
| F-1-10 | Fixed for the prior shell/metadata scope | 404 has header, footer, metadata, icons, legal links, and HTTP 404; F-2-8 through F-2-10 are new copy/consistency defects |
| F-1-11 | Fixed | Demo action now moves and focuses the course heading |
| F-1-12 | Fixed | No landing or README sentence exceeds 22 words |
| F-1-13 | Fixed | “Decrease power” |
| F-1-14 | Fixed | “Increase power” |
| F-1-15 | Fixed | Sound controls name the action |
| F-1-16 | Fixed | Isolated mode is consistently called demo |
| F-1-17 | Fixed | Win and loss screens copy non-spoiling results with fallback text |

Review 1 also carried forward earlier verification IDs. They were rechecked rather than accepted from the handoff.

| Earlier ID | Current result |
|---|---:|
| B-01 demo wrote real storage | Fixed |
| B-02 mobile hid product | Fixed |
| B-03 incomplete registry | **Regressed / blocking through F-2-4** |
| H-01 run persistence | Fixed |
| H-02 sound restore/play | Fixed |
| H-03 distinct loss | Fixed |
| H-04 live CSP | Fixed |
| M-01 inaccurate demo banner | Fixed |
| M-02 targets under 44px | Fixed |
| M-03 pause allowed shots | Fixed |
| M-04 zero-length click shot | Fixed |
| M-05 immutable caching | Fixed |
| M-06 unknown route | Fixed |
| M-07 route focus | Fixed |
| L-01 route metadata | Fixed on valid routes and 404 |
| L-02 social card size | Fixed; 1200×630 |

## Structure, accessibility, and build checks

| Check | Result |
|---|---:|
| `/`, `/demo`, `/privacy`, `/terms` | 200 |
| Unknown route | Designed page with HTTP 404 |
| Titles | Pass; route-specific, plain, and under 60 characters |
| One h1 and one main | Pass on all checked routes |
| Description, canonical, OG, favicon | Pass on all checked routes |
| Header/footer | Product routes pass; 404 header inconsistency is F-2-10 |
| 404 plain words | Fail; F-2-8 and F-2-9 |
| Deep links, Back, focus, announcement | Pass; Privacy and browser Back both focused the destination h1 |
| Link crawl | Pass; all intended internal destinations returned 200; unknown route correctly returned 404 |
| `robots.txt` and `sitemap.xml` | Pass; sitemap lists all four public product routes |
| Security headers | Pass; CSP, `frame-ancestors`, `nosniff`, referrer policy, and HSTS present |
| Valid-route console/page errors | None |
| Same-origin requests/cookies | Pass; no third-party request and no cookie |
| Axe | Zero serious or critical issues on home, demo, privacy, terms, and 404 |
| Keyboard route focus | Pass; Reset demo focus regression is F-2-6 |
| Reduced motion and 200% text | Pass |
| Touch targets | Pass at 390×844 |
| Visual identity | Pass; blueprint grid, drafting paper, cyan path, coral bumper, and gold cup are product-specific |
| `npm test` | Pass, 10/10 |
| `npm run build` | Pass; `dist/` produced |
| Live browser suite | Pass, 22/22 |
| `verify-url.sh` on live `/demo` | Pass; 666 ms, no console/page errors, title/lang/h1/main/alt/button checks pass |
| First-load JavaScript | Pass; 21.36 kB raw / 8.12 kB gzip |

## Missed leverage

No additional AI, import, export, sync, account, or leaderboard feature is implied strongly enough to add. The core job is a deterministic short daily game. The expected non-spoiling result share from review 1 now exists on both outcomes. AI would be decorative, and sync would conflict with the product’s local, account-free scope unless the brief changed.

## What would make this perfect

Resolve F-2-1 through F-2-14. The next review must compare predicted and actual later-shot trajectories, exercise every advertised input and the complete free flow, remove or prove the provenance and sound-fallback claims, preserve focus after demo reset, use literal 404 copy and a consistent header, and remove the three README terminology problems. Then rerun all 20 claim commands separately from a clean clone plus the full live browser, accessibility, crawl, storage, and request-log checks. Per the requested standard, nothing else should remain.

# Adversarial first-read review 3 — Pinpoint Daily

Date: 2026-09-02 UTC

Candidate: `a308929b2526ea0b0759b81c9b00531befde1385`

Live site: `https://pinpoint-daily.sociobot.in`

## Verdict: FAIL

The cold first screen, one-click demo, live game, routing, build, accessibility, and all 19 registered claim commands work. The product still fails because claim coverage is incomplete and two fixed-name icons are incorrectly cached as immutable. The passing test commands do not prove every sentence a visitor can rely on.

- Blocking findings: 4
- Minor findings: 2
- Registered claim commands run from a clean checkout: 19 of 19 passed
- Registered claims independently confirmed in full: 17 of 19
- Unlisted claim groups: 2

## Cold first read

I opened `/` without stored state in fresh Chromium contexts and did not scroll.

| View | What does it do? | For whom? | What should I click first? | Result |
|---|---|---|---|---|
| 390×844 | A shared three-hole tabletop golf physics puzzle that changes each UTC day. | Players who want a short physics puzzle. | **Try it with sample data**; the adjacent sentence says it opens a demo in separate storage. | Pass |
| 1440×900 | The same short daily tabletop golf puzzle, with a visible shot path and playable board. | Players who want a short shared puzzle. | **Try it with sample data**. | Pass |

The exact first-screen copy is **“Play today’s three-hole course”**, **“For players who want a short physics puzzle with one shared course each day”**, and **“Try it with sample data.”** On the phone, the h1 begins at y=98, the action at y=264, and the canvas occupies y=540–747. On desktop, the h1 begins at y=132, the action at y=398, and the canvas begins at y=717. The first-read gate passes.

## Findings

### Blocking

#### F-3-1 / B-03 recurrence — README promises that demo data is never read, but the registry does not

- Quote/location: README line 33, **“The demo uses separate browser storage and never reads or changes ordinary game data.”**
- Evidence: `demo-isolation` claims only that the demo **“never changes ordinary game data.”** Its test seeds a real key without a current run, changes demo sound, and compares the real key. It never proves that demo mode did not read a real run, best score, completed date, or sound setting.
- Why this fails: “never reads” is a stronger privacy promise than “never changes.” It is absent from `.factory/claims.json`, which reopens the earlier incomplete-registry finding `B-03`. Code inspection and a direct live check indicate that the namespaces are currently separate, but the required regression proof is missing.
- Concrete fix: add **“never reads or changes ordinary game data”** to `demo-isolation`. Seed contradictory real values for run, best, completed dates, and sound; enter both `/demo` and `/?demo=1`; assert that the sample starts from its own seed and defaults and that the real key remains unchanged. Alternatively remove **“never reads or”** from README.

#### F-3-2 — the local-privacy test does not prove “no accounts, ads, or analytics”

- Quote/location: landing privacy section, **“It has no accounts, ads, or analytics. Game data stays in your browser.”** README line 7 adds **“There are no accounts, ads, analytics, cookies, or third-party game requests.”** Registered claim: `local-privacy`.
- Evidence: `tests/app.e2e.ts:272-281` checks only that requests are same-origin GETs and that the cookie jar is empty. It does not check account or ad UI. It also permits a first-party analytics request such as `GET /collect?score=…`, so it does not prove that game data stays in the browser.
- Why this fails: a passing claim tag can miss every unverified part of its own public promise. This is an untested registered claim and therefore blocking.
- Concrete fix: exercise the complete demo flow and all result states; assert the exact allowlist of document/static-asset GETs with no data-bearing query strings; assert no account/sign-in forms or controls, ad regions/frames, analytics resources, cookies, beacons, WebSockets, or non-GET requests.

#### F-3-3 — the shared-course test observes only hole one

- Quote/location: landing/README, **“Play one shared three-hole tabletop golf course each day.”** Registered claim: `shared-daily-course`.
- Evidence: `tests/app.e2e.ts:84-97` compares a seed attribute and one initial canvas screenshot in two contexts. Neither context advances to holes two or three. The unit test compares `makeCourse(seed)` with another call in the same process, not the browser-visible three-hole run.
- Why this fails: the promise covers all three holes, while the tagged test can pass if later holes diverge between players. The command passes, but the claim is not tested in full.
- Concrete fix: in two fresh fixed-clock contexts, compare the rendered canvas or serialized course geometry on holes one, two, and three after identical advancement. Also assert the three-hole sequence remains identical after reload.

#### F-3-4 / B-03 recurrence — storage-removal promises are not in the claim registry

- Quotes/locations: `/privacy`, **“Clear this site’s browser data to delete all saved game data.”** Landing confirmation dialog, **“This cannot be undone.”**
- Evidence: `clear-local-score-history` tests the in-product control that removes only best score and completed dates. No registry entry clears origin storage and checks every saved field. No test checks the no-undo warning.
- Why this fails: these are separate outcomes a visitor can rely on, not descriptions covered by the narrower score-history claim. They are unlisted claims, so `B-03` remains regressed.
- Concrete fix: add one `storage-removal` claim and tagged test. Seed real and demo run, history, and sound fields; clear origin browser storage; reload both modes; assert every field is gone and no Undo control or restoration path appears. Otherwise remove the two promises or narrow them to tested behavior.

### Minor

#### F-3-5 — the mandatory first-screen facts omit offline status

- Quote/location: first-screen facts, **“Free to play”**, **“Five shots per hole”**, and **“Scores stay on this device.”**
- Why this matters: price and privacy are disclosed, but the required privacy/offline/price fact set does not tell a phone visitor whether the game can reopen without a connection. The product makes no offline claim and ships no service worker.
- Concrete fix: replace the game-rule fact or add a fourth short fact that states the actual limitation, such as **“Internet needed to open”**, and register a test for that statement.

#### F-3-6 — fixed-name icons are cached as immutable for one year

- Location: `public/staticwebapp.config.json` and root `staticwebapp.config.json`, route `/*.svg`; live `/favicon.svg` and `/apple-touch-icon.svg` responses.
- Evidence: both stable URLs return `Cache-Control: public, max-age=31536000, immutable`. The config unit test is named **“sets immutable caching only for hashed build assets”** but checks only that `/*.webp` is absent and misses `/*.svg`.
- Why this matters: replacing either icon at the same URL can leave returning visitors on the old identity for a year. This also contradicts `.factory/polish-2.md`, which says only hashed assets are immutable.
- Concrete fix: remove the `/*.svg` immutable rule and let fixed-name icons revalidate, or fingerprint the icon filenames and references. Extend the config test to reject every non-hashed immutable route.

## Copy audit

Counts use words and numerals; punctuation-only marks do not count. No sentence exceeds 22 words. No banned marketing adjective appears. Headings are literal, terminology is consistent, and visible buttons name an action or result. Claim-related flags are shown below.

### Landing, demo, and game copy

| Location | Sentence or label | Words | Result |
|---|---|---:|---|
| Skip link | Skip to main content | 4 | Pass |
| Wordmark | Pinpoint Daily | 2 | Pass |
| Nav | Demo | 1 | Pass |
| Nav | How it works | 3 | Pass |
| Nav/footer | Privacy | 1 | Pass |
| Footer | Terms | 1 | Pass |
| Date label | Today’s shared course · Wed 2 Sept | 6 | Pass; date varies |
| Demo date label | Sample course · 1 Sep 2026 | 5 | Pass |
| Demo banner | Demo — sample data, saved only here | 6 | Pass |
| Demo action | Reset demo | 2 | Pass |
| Demo action | Start for real | 3 | Pass |
| H1 | Play today’s three-hole course | 4 | Pass |
| Lead | For players who want a short physics puzzle with one shared course each day. | 14 | Pass |
| Primary action | Try it with sample data | 5 | Pass |
| Action help | Opens a demo course in separate storage. | 7 | Pass |
| Demo action | Play the sample course | 4 | Pass |
| Demo action help | Moves focus to the demo course. | 6 | Pass |
| Fact | Free to play | 3 | F-3-5 as a fact set |
| Fact | Five shots per hole | 4 | F-3-5 as a fact set |
| Fact | Scores stay on this device | 5 | F-3-5 as a fact set |
| Image alt | A tabletop golf course drawn on a navy blueprint sheet. | 10 | Pass |
| Section label | Live course | 2 | Pass |
| H2 | Aim, check the dotted path, then shoot | 7 | Pass |
| Game help | Drag away from the ball to set aim and power. | 10 | Pass |
| Canvas label | Interactive tabletop golf course | 4 | Pass |
| Score | Hole 1 of 3 | 4 | Pass; values vary |
| Score | Shots: 0 / 5 | 4 | Pass; values vary |
| Score | Cups: 0 / 3 | 4 | Pass; values vary |
| Wind | No wind | 2 | Pass |
| Wind | Wind → light / Wind ← light | 2 each | Pass |
| Control | Pause / Resume | 1 each | Pass |
| Control name | Aim left / Aim right | 2 each | Pass |
| Control | Decrease power / Increase power | 2 each | Pass |
| Control | Shoot | 1 | Pass |
| Control | Reset hole | 2 | Pass |
| Control | Turn sound on / Turn sound off | 3 each | Pass |
| Status | Drag from the ball, or use arrow keys and Enter. | 10 | Pass |
| Control | Clear local score history | 4 | Pass |
| Dialog h2 | Clear saved score history? | 4 | Pass |
| Dialog detail | This deletes the best score and completed dates for this demo. | 11 | Pass |
| Dialog detail | This deletes the best score and completed dates for this game. | 11 | Pass |
| Dialog detail | It keeps your current run and sound setting. | 8 | Pass |
| Dialog warning | This cannot be undone. | 4 | F-3-4 |
| Dialog action | Keep saved data | 3 | Pass |
| Dialog action | Clear best score and completed dates | 6 | Pass |
| Error | Sound could not start in this browser. | 7 | Pass |
| Status | Ball rolling. | 2 | Pass |
| Status | Watch the bounce. | 3 | Pass |
| Status | Hole reset. | 2 | Pass |
| Status | Your used shots remain counted. | 5 | Pass |
| Status | Game paused. / Game resumed. | 2 each | Pass |
| Status | Power set to 105. | 4 | Pass; value varies |
| Status | Saved score history cleared. | 4 | Pass |
| Status | Your current run and sound setting remain. | 7 | Pass |
| Win h3 | Course complete — you won | 4 | Pass |
| Win result | You sank all three cups in 3 shots. | 8 | Pass; value varies |
| Win result | That is your local best. | 5 | Pass |
| Win result | Local best: 3 shots. | 4 | Pass; value varies |
| Loss h3 | Course over — try again | 4 | Pass |
| Loss result | You sank 0 of 3 cups. | 6 | Pass; value varies |
| Loss result | Sink every cup to win. | 5 | Pass |
| Result action | Copy today’s result | 3 | Pass |
| Result action | Play again | 2 | Pass |
| Fallback label | Copy this result | 3 | Pass |
| Share status | Today’s result copied. | 3 | Pass |
| Share status | Copy the selected result above. | 5 | Pass |
| Status | New run. | 2 | Pass |
| Status | Read the path before shooting. | 5 | Pass |
| Status | In the cup. | 3 | Pass |
| Status | Next hole. | 2 | Pass |
| Status | Five shots used. | 3 | Pass |
| Status | That hole was lost. | 4 | Pass |
| Status | Finished run restored. | 3 | Pass |
| Status | Run restored at hole 2. | 5 | Pass; value varies |
| Section label | How it works | 3 | Pass |
| H2 | Play the daily course in three steps | 7 | Pass |
| Step | Read the board. | 3 | Pass |
| Step detail | Wind, walls, and the moving bumper are visible. | 8 | Pass |
| Step | Drag a shot. | 3 | Pass |
| Step detail | The dotted path previews bounces before release. | 7 | Pass |
| Step | Finish three holes. | 3 | Pass |
| Step detail | Sink every cup to win. | 5 | Pass |
| Step detail | Five missed shots lose a hole. | 6 | Pass |
| H2 | What this game does not do | 6 | Pass |
| Privacy | It has no accounts, ads, or analytics. | 7 | F-3-2 |
| Privacy | Game data stays in your browser. | 6 | F-3-2 |
| Footer | Play one shared tabletop course each day. | 7 | F-3-3 |
| Footer | Built by Param Factory · build 1.2.3 | 6 | Pass |

### README copy

| Location | Sentence or heading | Words | Result |
|---|---|---:|---|
| H1 | Pinpoint Daily | 2 | Pass |
| Intro | Play one shared three-hole tabletop golf course each day. | 9 | F-3-3 |
| Intro | It is for players who want a short browser physics puzzle. | 11 | Pass |
| Intro | Drag to aim and power a shot. | 7 | Pass |
| Intro | The dotted path previews bounces before you shoot. | 8 | Pass |
| Intro | The UTC date chooses the daily course. | 7 | Pass |
| Intro | Physics updates 60 times each second. | 6 | Pass |
| Intro | Each hole has five shots, visible wind, and one moving bumper. | 11 | Pass |
| Intro | Sink every cup to win; a missed hole produces a separate loss screen. | 13 | Pass |
| Intro | Copy the date, cups, and shots from either result screen. | 10 | Pass |
| Intro | The game targets 60 rendered frames per second on a mid-range phone. | 12 | Pass |
| Intro | The full game is free. | 5 | Pass |
| Intro | Your current run, completed dates, best score, and sound preference stay in browser storage. | 14 | Pass |
| Intro | There are no accounts, ads, analytics, cookies, or third-party game requests. | 11 | F-3-2 |
| H2 | Run it | 2 | Pass |
| Run | Open `http://localhost:5173/`. | 2 | Pass |
| Run | The one-click demo is `/demo` or `/?demo=1`. | 7 | Pass |
| H2 | Verify it | 2 | Pass |
| H2 | Play controls | 2 | Pass |
| Control | Drag away from the ball, then release to shoot. | 9 | Pass |
| Control | Arrow keys set aim and power. | 6 | Pass |
| Control | Enter shoots. | 2 | Pass |
| Control | R resets the current hole. | 5 | Pass |
| Control | Escape pauses or resumes. | 4 | Pass |
| Control | Touch players can drag or use the labelled on-screen controls. | 10 | Pass |
| Play | A run has three holes. | 5 | Pass |
| Play | Progress, completed dates, best score, and sound preference persist locally. | 10 | Pass |
| Play | The demo uses separate browser storage and never reads or changes ordinary game data. | 14 | F-3-1 |
| H2 | Deploy | 1 | Pass |
| Deploy | `npm run build` creates `dist/` with static files, route rewrites, and security headers. | 13 | Pass |
| Deploy | Upload the contents of `dist/` to the static host. | 9 | Pass |
| H2 | License | 1 | Pass |
| License | MIT. | 1 | Pass; matches `LICENSE` |
| License | See `LICENSE`. | 2 | Pass |

### Terminology

| Concept | Preferred term | Observed result |
|---|---|---|
| Audience | players | Consistent |
| Day-specific set | course | Consistent; “daily,” “shared,” and “tabletop” are useful modifiers |
| One challenge | hole | Consistent |
| Shot preview | dotted path | Consistent |
| Moving obstacle | bumper | Consistent |
| Isolated sample mode | demo | Consistent after the required sample-data entry label |
| Device persistence | browser storage | Consistent in public copy |

## Demo and sandbox behavior

I seeded `pinpoint:daily-v1` with `{"best":9,"completed":["20260831"],"sound":false}` before selecting the landing action.

| Check | Result | Evidence |
|---|---:|---|
| One click enters demo | Pass | `/` became `/demo`; title became `Demo — Pinpoint Daily` |
| Product is already in use | Pass | At 390×844, the seeded course canvas occupies y=633–840 with score, walls, bumper, cup, path, and controls |
| Realistic sample | Pass | Fixed seed `20260901` supplies a complete three-hole course, not placeholder text |
| Persistent banner | Pass | **Demo — sample data, saved only here**, **Reset demo**, and **Start for real** remain visible |
| Separate writes | Pass | Sound wrote only `demo:daily-v1`; the seeded real key remained byte-for-byte unchanged |
| Reset | Pass | Removed only the demo key, focused **Reset demo**, and announced **“Demo reset.”** |
| Start for real | Pass | Removed the demo key, kept the real key, returned to `/`, and removed the banner |
| Direct entry | Pass | `/demo` and `/?demo=1` use the sample seed and demo namespace |
| Requests and cookies | Direct behavior passes | Same-origin GETs only; no cookies. F-3-2 records why the registered test still permits first-party analytics GETs |
| Offline reload | Not applicable | No offline claim or service worker is present; F-3-5 concerns first-screen disclosure |

## Claims

Every exact command in `.factory/claims.json` was run separately after `npm ci` in clean checkout `/tmp/pinpoint-review3-clean-kGQ41j/repo`.

| Claim ID | Command | Review result |
|---|---:|---|
| `demo-isolation` | Pass | Pass for its narrower wording; README’s stronger no-read promise is F-3-1 |
| `demo-focus` | Pass | Pass |
| `shared-daily-course` | Pass | **Untested in full — F-3-3** |
| `visible-prediction` | Pass | Pass; source passes the live simulation snapshot into prediction |
| `visible-course-elements` | Pass | Pass |
| `five-shot-limit` | Pass | Pass |
| `run-persistence` | Pass | Pass |
| `sound-setting` | Pass | Pass |
| `local-privacy` | Pass | **Untested in full — F-3-2** |
| `input-methods` | Pass | Pass |
| `distinct-outcomes` | Pass | Pass |
| `best-score` | Pass | Pass |
| `restart-reset` | Pass | Pass |
| `completed-date-persistence` | Pass | Pass |
| `clear-local-score-history` | Pass | Pass for its narrower wording; F-3-4 covers separate removal statements |
| `result-sharing` | Pass | Pass |
| `frame-rate-target` | Pass | Pass; measured 55–65 fps bound under the registered 4× throttle sandbox |
| `free-play` | Pass | Pass; the test completes all three holes |
| `static-deploy` | Pass | Pass |

No other landing, README, legal-route, or result sentence lacked a matching tested behavior.

## Earlier findings rechecked

### Review 1

| Earlier ID | Current result | Current evidence |
|---|---:|---|
| F-1-1 | Fixed | “fair” remains absent; shared wording is concrete |
| F-1-2 | Fixed | Public-leaderboard sentence remains absent |
| F-1-3 | Fixed | `/?demo=1` enters isolated demo storage and the tagged test covers it |
| F-1-4 | Fixed | README test-coverage promise remains removed; registry integrity passes |
| F-1-5 | Fixed | `static-deploy` builds and serves static output |
| F-1-6 | Fixed | Deep routes and response security headers pass |
| F-1-7 | Fixed | Public artwork-provenance claim remains removed |
| F-1-8 | Fixed | Terms says only **“Pinpoint Daily is free to play.”** |
| F-1-9 | Fixed | Completed date is saved and restored in the tagged test |
| F-1-10 | Fixed | Live 404 returns 404 with full shell, metadata, icons, and legal links |
| F-1-11 | Fixed | Demo action is **“Play the sample course”** and focuses the course heading |
| F-1-12 | Fixed | No audited sentence exceeds 22 words |
| F-1-13 | Fixed | **Decrease power** |
| F-1-14 | Fixed | **Increase power** |
| F-1-15 | Fixed | **Turn sound on/off** |
| F-1-16 | Fixed | Public isolated-mode terminology is consistently **demo** |
| F-1-17 | Fixed | Both outcomes copy date, cups, and shots with a fallback |

### Review 2

| Earlier ID | Current result | Current evidence |
|---|---:|---|
| F-2-1 | Fixed | `src/main.ts` calls `predictedPoints(hole, sim.snapshot(), aim)`; first/later bumper-phase tests pass |
| F-2-2 | Fixed | Both arrow directions and every labelled aim/power/shoot/reset control are operated in the tagged test |
| F-2-3 | Fixed | The free-play test completes all three holes and checks the result screen |
| F-2-4 | Fixed | Unsupported no-sound fallback sentence remains removed |
| F-2-5 | Fixed | Public generated-artwork claim remains removed |
| F-2-6 | Fixed | Reset restores focus and announces completion |
| F-2-7 | Fixed | Every route uses **“Skip to main content”** |
| F-2-8 | Fixed | 404 eyebrow is **“PAGE NOT FOUND · 404”** |
| F-2-9 | Fixed | Both 404 implementations use **“This page does not exist”** |
| F-2-10 | Fixed | 404 header includes **How it works** |
| F-2-11 | Fixed | README audience is **players** |
| F-2-12 | Fixed | README says the UTC date chooses the course |
| F-2-13 | Fixed | README explains 60 updates per second |
| F-2-14 | Fixed for terminology | README uses **browser storage**; its overlooked no-read claim is new F-3-1 |

### Findings carried through the prior reviews and handoffs

| Earlier ID | Current result |
|---|---:|
| B-01 | Fixed; direct demo writes and Reset affect only `demo:daily-v1` |
| B-02 | Fixed; phone first screen contains the playable canvas |
| B-03 | **Regressed through F-3-1 and F-3-4** |
| H-01 | Fixed; current run reload passes |
| H-02 | Fixed; sound gesture and persistence pass |
| H-03 | Fixed; win and loss screens are distinct |
| H-04 | Fixed; live responses carry CSP as a header |
| M-01 | Fixed; banner accurately says demo data is saved only there |
| M-02 | Fixed; live suite confirms 44 px targets |
| M-03 | Fixed; pause blocks shots |
| M-04 | Fixed; zero-length pointer input does not shoot |
| M-05 | Fixed in its original hashed-asset scope; fixed-name SVG regression is F-3-6 |
| M-06 | Fixed; unknown address returns designed HTTP 404 |
| M-07 | Fixed; route changes and Back restore h1 focus and announcement |
| L-01 | Fixed; each route updates title, description, canonical, and social metadata |
| L-02 | Fixed; social card is 1200×630 |

## Structure, accessibility, and build

| Check | Result |
|---|---:|
| `/`, `/demo`, `/privacy`, `/terms` | 200 |
| Unknown route | Designed page with HTTP 404 |
| Titles | Route-specific, plain, and under 60 characters |
| One h1 and one main | Pass on every route and 404 |
| Description, canonical, OG, Twitter, favicon | Pass on every route and 404 |
| Header/footer consistency | Pass |
| Deep links, History API, Back, h1 focus, live announcement | Pass |
| Link crawl | All intended internal links return 200; test unknown route returns expected 404 |
| `robots.txt` and `sitemap.xml` | Pass; sitemap lists all four public routes |
| Security headers | CSP, `frame-ancestors`, `nosniff`, referrer policy, and HSTS present |
| Console and page errors | None |
| Axe 4.13 integration | Zero violations of any impact on home, demo, privacy, terms, and 404 |
| Keyboard, reduced motion, 200% text, touch targets | Pass in live browser suite |
| Visual identity | Pass; blueprint grid, drafting paper, cyan path, coral bumper, and gold cup are product-specific |
| `npm test` | Pass, 10/10 |
| `npm run build` | Pass; `dist/` produced |
| Production JS | 21.42 kB raw / 8.12 kB gzip |
| Live Playwright suite | Pass, 21/21 |
| `verify-url.sh` | Pass; 614 ms, no errors, title/lang/h1/main/alt/button checks pass |

## Missed leverage

No AI, import, sync, account, or leaderboard feature is implied strongly enough to add. This is a deterministic daily physics game, and AI would be decorative. The expected non-spoiling result copy already exists on both outcomes. No provider key or third-party model call is present.

## What would make this perfect

Resolve F-3-1 through F-3-6. Register and fully test the stronger demo-read and storage-removal promises, make the privacy and three-hole shared-course tests cover their complete wording, disclose the real offline limitation on the first screen, and stop immutable caching on fixed icon URLs. Then rerun every claim command independently from a clean checkout plus the full local/live browser, request-log, accessibility, route, and cache checks. Under the requested standard, nothing else should remain.

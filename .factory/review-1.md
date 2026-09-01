# Adversarial first-read review 1 — Pinpoint Daily

Date: 2026-09-01 UTC

Candidate: `e2750da7b01c457e48e7e27fcc573507158b898b`

Live site: `https://pinpoint-daily.sociobot.in`

## Verdict: FAIL

The cold first screen, demo isolation, game flow, listed claim tests, build, and automated accessibility checks pass. The review still fails because there are findings. In particular, the earlier claim-registry completeness blocker (`B-03` in `.factory/verification.md`, repeated in the handoff) has recurred: claim-like copy remains outside `.factory/claims.json`.

- Blocking findings: 9
- Minor findings: 8
- Listed claims tested: 13 of 13; all passed
- Unlisted or untestable claims: 9

## Cold first read

I opened `/` in two fresh browser contexts without scrolling.

| View | What does it do? | For whom? | What should I click first? | Result |
|---|---|---|---|---|
| 390×844 | It is a daily three-hole tabletop golf physics puzzle with a visible shot path. | Players who want a short physics puzzle on the same course as everyone else. | **Try it with sample data**. The adjacent line says it opens a practice course in separate demo storage. | Pass |
| 1440×900 | It is the same daily three-hole game, with a blueprint course preview and the live board beginning below it. | Players who want a short shared physics puzzle. | **Try it with sample data**. | Pass |

On mobile, the `h1` begins at y=98, the primary action at y=264, and the live canvas at y=540. On desktop, the `h1` begins at y=132 and the action at y=398. All three required answers are available before scrolling.

## Findings

### Blocking — recurrence of the earlier `B-03` claims-registry finding

#### F-1-1 — “fair” is an unlisted, unmeasured claim

- Quote/location: landing lead, **“For players who want a short physics puzzle with the same fair course for everyone.”**
- Why this fails: `shared-daily-course` proves that the course is the same. It does not define or test fairness. A first-time player can reasonably read “fair” as a promise about course balance.
- Concrete fix: use **“For players who want a short physics puzzle with one shared course each day.”**

#### F-1-2 — the absence of a public leaderboard is not in the claim registry

- Quote/location: landing privacy section, **“It has no accounts, ads, analytics, or public leaderboard.”**
- Why this fails: `local-privacy` lists accounts, ads, analytics, cookies, and third-party requests, but not a public leaderboard. Its test does not assert the absence of leaderboard UI or traffic.
- Concrete fix: remove **“or public leaderboard”**, or add it to `local-privacy` and assert no leaderboard UI and no leaderboard request during the complete demo flow.

#### F-1-3 — the documented `/?demo=1` entry point is not covered

- Quote/location: README, **“The one-click sandbox is `/demo` or `/?demo=1`.”**
- Why this fails: the `demo-isolation` test selects the landing link and reaches `/demo`; no claim test opens `/?demo=1`. Manual review confirmed the alias works, but the required clean-sandbox regression is absent.
- Concrete fix: extend the single `@claim:demo-isolation` test to open `/?demo=1`, verify the banner and `demo:daily-v1` namespace, and confirm the real key is unchanged.

#### F-1-4 — README test-coverage copy is an unlisted claim

- Quote/location: README, **“The browser suite covers every entry in `.factory/claims.json`, deterministic win and loss runs, reloads, mobile layout, response safety, and serious or critical accessibility findings.”**
- Why this fails: this is a concrete assurance about test coverage, but there is no claim entry that verifies registry-to-test completeness and the listed structural checks.
- Concrete fix: add one registry-integrity test that compares every claim ID with exactly one Playwright tag and checks the named non-claim scenarios, then list that assurance in `claims.json`; otherwise remove the sentence.

#### F-1-5 — the static-site implementation statement is unlisted

- Quote/location: README, **“This is a Vite static site.”**
- Why this fails: deployers can rely on this architecture statement, but no claim entry proves the output is self-contained static content.
- Concrete fix: combine it with a `static-deploy` claim whose test runs the build and asserts that `dist/` contains the site and no server runtime, or rewrite the section as a direct command without the claim.

#### F-1-6 — the deployment behavior statement is unlisted

- Quote/location: README, **“Deploy the contents of `dist/` with the included `staticwebapp.config.json` for SPA deep links and security headers.”**
- Why this fails: this promises both deep-link routing and response security behavior. Existing config tests are not tagged in `.factory/claims.json` and do not exercise the deployed routes.
- Concrete fix: add a `static-deploy` claim test that builds, serves the output with the stated configuration, opens `/demo`, `/privacy`, and `/terms`, and checks CSP, referrer policy, and MIME protection.

#### F-1-7 — the public originality statement has no sandbox proof

- Quote/location: landing footer, **“Course art uses original generated imagery.”**
- Why this fails: the footer makes a provenance claim that no claim entry or automated check supports. `.factory/design.md` records provenance, but that is not a sandbox test of the public statement.
- Concrete fix: remove the public sentence and keep the required provenance in `.factory/design.md`, or add a build-time provenance manifest/hash check and list the narrower verifiable claim.

#### F-1-8 — “general audiences” is vague and unlisted

- Quote/location: `/terms`, **“Pinpoint Daily is a free game for general audiences.”**
- Why this fails: “general audiences” can imply an age or suitability classification, but neither the term nor its evidence is defined. `free-play` only proves that the game is free and needs no account or payment.
- Concrete fix: use the covered statement **“Pinpoint Daily is free to play.”**

#### F-1-9 — completed-date persistence is not tested

- Quote/location: `/privacy`, **“Your current run, completed dates, sound setting, and best score use local browser storage.”**
- Why this fails: claim tests cover the run, best score, and sound setting. None asserts that completed dates are written and restored.
- Concrete fix: add `completed-date-persistence` with a demo win, reload, and stored-date assertion, or remove **“completed dates”** from the sentence.

### Minor

#### F-1-10 — the designed 404 drops the standard site shell and metadata

- Quote/location: direct unknown route such as `/not-a-route`; `public/404.html`.
- Why this matters: the page returns the correct HTTP 404 and has a styled route home, but it has no product header, footer, skip link, meta description, canonical, Open Graph/Twitter metadata, favicon, or theme color. The site-structure contract requires a consistent header/footer and metadata on every route.
- Concrete fix: give `404.html` the same wordmark/header/footer and metadata set as the app routes while retaining the blueprint styling, one `h1`, home action, and HTTP 404 response.

#### F-1-11 — demo mode repeats an action that has no new result

- Quote/location: `/demo`, **“Try it with sample data”** remains below the lead after that same action has already opened the demo.
- Why this matters: selecting it again only routes to `/demo` and redraws the same screen. A first-time visitor can mistake it for the control that starts play.
- Concrete fix: hide the landing CTA in demo mode, or replace it with **“Play the sample course”** linked to `#course-heading` with focus moved to the board instructions.

#### F-1-12 — one README sentence exceeds 22 words

- Quote/location: README test-coverage sentence in F-1-4; 24 words.
- Why this matters: it exceeds the plain-words hard cap and combines coverage areas into one dense sentence.
- Concrete rewrite: **“Browser tests cover each claim, deterministic outcomes, reloads, and mobile layout. They also check response safety and serious or critical accessibility findings.”**

#### F-1-13 — “Less power” does not name the button result as a verb

- Quote/location: game controls, **“Less power”**.
- Why this matters: it describes a direction but not the action that will occur.
- Concrete rewrite: **“Decrease power”**.

#### F-1-14 — “More power” does not name the button result as a verb

- Quote/location: game controls, **“More power”**.
- Why this matters: it describes a direction but not the action that will occur.
- Concrete rewrite: **“Increase power”**.

#### F-1-15 — “Sound off” reports state instead of the button result

- Quote/location: game controls, **“Sound off”**; after activation it becomes **“Sound on”**.
- Why this matters: the visible label does not say what activation will do. `aria-pressed` exposes state, but the plain-words rule requires the action result.
- Concrete rewrite: use **“Turn sound on”** when off and **“Turn sound off”** when on; retain `aria-pressed`.

#### F-1-16 — the isolated sample mode has inconsistent names

- Quote/location: landing action **“sample data”**, helper **“practice course”**, banner **“Demo”**, and README **“one-click sandbox”**.
- Why this matters: four terms describe one mode. A first-time visitor has to infer that they all mean the same isolated course.
- Concrete fix: keep the required action **“Try it with sample data”**, then use **“demo”** consistently: **“Opens a demo course in separate storage”** and **“The one-click demo is `/demo`.”**

#### F-1-17 — a shared daily puzzle cannot share its result

- Location: completed win/loss screens and the brief’s “shared three-hole course each day” job.
- Why this matters: a normal player of a shared daily puzzle expects a non-spoiling way to compare the day’s outcome. The product records a result but offers no copy/share action.
- Concrete fix: add **“Copy today’s result”** after win and loss. Copy the UTC date, cups, and shot total without course geometry; provide a selectable-text fallback when Clipboard API access fails. Add a claim and demo test for the copied text. No AI, account, sync, or provider key is warranted.

## Copy audit

Counts are whitespace-delimited. Code blocks are commands, not sentences. Headings, labels, and controls are included because they must also be clear out of context.

### Landing and game page

| Location | Copy | Words | Result |
|---|---|---:|---|
| Skip link | Skip to game | 3 | Pass |
| Wordmark | PINPOINT DAILY | 2 | Pass |
| Nav | Demo | 1 | Pass |
| Nav | How it works | 3 | Pass |
| Nav/footer | Privacy | 1 | Pass |
| Date label | TODAY’S SHARED COURSE · TUE 1 SEPT | 7 | Pass |
| H1 | Play today’s three-hole course | 4 | Pass |
| Lead | For players who want a short physics puzzle with the same fair course for everyone. | 15 | F-1-1 |
| Primary action | Try it with sample data | 5 | Pass on `/`; F-1-11 on `/demo` |
| Action helper | Opens a practice course in separate demo storage. | 8 | F-1-16 |
| Fact | Free to play | 3 | Pass |
| Fact | Five shots per hole | 4 | Pass |
| Fact | Scores stay on this device | 5 | Pass |
| Section label | LIVE COURSE | 2 | Pass |
| H2 | Aim, check the dotted path, then shoot | 7 | Pass |
| Game help | Drag away from the ball to set aim and power. | 10 | Pass |
| Score | Hole 1 of 3 | 4 | Pass |
| Score | Shots: 0 / 5 | 4 | Pass |
| Score | Cups: 0 / 3 | 4 | Pass |
| State | No wind | 2 | Pass |
| Button | Pause | 1 | Pass |
| Button | ← Aim | 2 | Pass |
| Button | Aim → | 2 | Pass |
| Button | Less power | 2 | F-1-13 |
| Button | More power | 2 | F-1-14 |
| Button | Shoot | 1 | Pass |
| Button | Reset hole | 2 | Pass |
| Button | Sound off | 2 | F-1-15 |
| Game status | Drag from the ball, or use arrow keys and Enter. | 10 | Pass |
| Button | Clear local score | 3 | Pass |
| Section label | HOW IT WORKS | 3 | Pass |
| H2 | Play the daily course in three steps | 7 | Pass |
| Step | Read the board. | 3 | Pass |
| Step detail | Wind, walls, and the moving bumper are visible. | 8 | Pass |
| Step | Drag a shot. | 3 | Pass |
| Step detail | The dotted path previews bounces before release. | 7 | Pass |
| Step | Finish three holes. | 3 | Pass |
| Step detail | Sink every cup to win. | 5 | Pass |
| Step detail | Five missed shots lose a hole. | 6 | Pass |
| H2 | What this game does not do | 6 | Pass |
| Privacy | It has no accounts, ads, analytics, or public leaderboard. | 9 | F-1-2 |
| Privacy | Game data stays in your browser. | 6 | Pass |
| Footer | Play one shared tabletop course each day. | 7 | Pass |
| Footer | Terms | 1 | Pass |
| Footer | Built by Param Factory · build 1.1.0 | 7 | Pass |
| Footer | Course art uses original generated imagery. | 6 | F-1-7 |
| Demo banner | Demo — sample data, saved only here | 6 | Pass |
| Demo button | Reset demo | 2 | Pass |
| Demo button | Start for real | 3 | Pass |
| Demo date label | SAMPLE COURSE · 1 SEP 2026 | 6 | Pass |

### README

| Location | Copy | Words | Result |
|---|---|---:|---|
| H1 | Pinpoint Daily | 2 | Pass |
| Intro | Play one shared three-hole tabletop golf course each day. | 9 | Pass |
| Intro | It is for web-game players who want a short physics puzzle. | 11 | Pass |
| Intro | Drag to aim and power a shot. | 7 | Pass |
| Intro | The dotted path previews bounces before you shoot. | 8 | Pass |
| Intro | The course uses a UTC daily seed, fixed 60 Hz physics, five shots per hole, visible wind, and one moving bumper. | 21 | Pass |
| Intro | Sink every cup to win; a missed hole produces a separate loss screen. | 13 | Pass |
| Intro | The game targets 60 rendered frames per second on a mid-range phone. | 12 | Pass |
| Intro | The full game is free. | 5 | Pass |
| Intro | Your current run, best score, and sound preference stay in browser storage. | 12 | Pass |
| Intro | There are no accounts, ads, analytics, cookies, or third-party game requests. | 11 | Pass |
| H2 | Run it | 2 | Pass |
| Run | Open `http://localhost:5173/`. | 2 | Pass |
| Run | The one-click sandbox is `/demo` or `/?demo=1`. | 7 | F-1-3, F-1-16 |
| H2 | Verify it | 2 | Pass |
| Verify | The browser suite covers every entry in `.factory/claims.json`, deterministic win and loss runs, reloads, mobile layout, response safety, and serious or critical accessibility findings. | 24 | F-1-4, F-1-12 |
| H2 | Play controls | 2 | Pass |
| Control | Drag away from the ball, then release to shoot. | 9 | Pass |
| Control | Arrow keys set aim and power. | 6 | Pass |
| Control | Enter shoots. | 2 | Pass |
| Control | R resets the current hole. | 5 | Pass |
| Control | Escape pauses or resumes. | 4 | Pass |
| Control | Touch players can drag or use the labelled on-screen controls. | 10 | Pass |
| Play | A run has three holes. | 5 | Pass |
| Play | Progress, best score, and sound preference persist locally. | 8 | Pass |
| Play | The demo uses a separate localStorage key and never reads or changes ordinary game data. | 15 | Pass |
| H2 | Deploy | 1 | Pass |
| Deploy | This is a Vite static site. | 6 | F-1-5 |
| Deploy | Deploy the contents of `dist/` with the included `staticwebapp.config.json` for SPA deep links and security headers. | 16 | F-1-6 |
| H2 | License | 1 | Pass |
| License | MIT. | 1 | Pass |
| License | See `LICENSE`. | 2 | Pass |

No banned plain-words term appears. One sentence exceeds 22 words. Headings otherwise name their sections and make sense out of context.

### Terminology check

| Concept | Preferred term | Observed alternatives | Result |
|---|---|---|---|
| Day-specific set of holes | course | shared course, daily course, tabletop course | Pass; modifiers add useful detail |
| One challenge | hole | none | Pass |
| Predicted shot line | dotted path | none | Pass |
| Moving obstacle | bumper | none | Pass |
| Isolated sample mode | demo | sample data, practice course, sandbox | F-1-16 |

## Demo and sandbox checks

The first-screen action was selected after seeding `pinpoint:daily-v1` with a known value.

| Check | Result | Evidence |
|---|---:|---|
| One click from `/` enters the demo | Pass | URL became `/demo`; title became `Demo — Pinpoint Daily` |
| First demo screen shows the product in use | Pass | Banner, fixed sample course, dotted path, ball, cup, obstacle, score, and controls are visible at 390×844 |
| Persistent demo banner | Pass | **Demo — sample data, saved only here**, **Reset demo**, and **Start for real** remained visible |
| Separate namespace | Pass | Changing sound wrote `demo:daily-v1`; seeded `pinpoint:daily-v1` stayed byte-for-byte unchanged |
| Reset | Pass | **Reset demo** removed only `demo:daily-v1`; the real key remained unchanged |
| Network/privacy | Pass | Only the product origin was requested; cookie jar remained empty |
| Direct `/demo` | Pass | Fixed sample seed loaded |
| Direct `/?demo=1` | Manual pass, claim gap | Banner and sample seed loaded, but F-1-3 records the missing claim regression |

The demo itself is not blocking. F-1-11 records the redundant in-demo CTA.

## Listed claims

Every exact command in `.factory/claims.json` was run separately after `npm ci` in a fresh local clone at `/tmp/pinpoint-review-YHm7R1/repo`.

| Claim ID | Exact command result |
|---|---:|
| `demo-isolation` | Pass, 1 test |
| `shared-daily-course` | Pass, 1 test |
| `visible-prediction` | Pass, 1 test |
| `visible-course-elements` | Pass, 1 test |
| `five-shot-limit` | Pass, 1 test |
| `run-persistence` | Pass, 1 test |
| `sound-setting` | Pass, 1 test |
| `local-privacy` | Pass, 1 test |
| `input-methods` | Pass, 1 test |
| `distinct-outcomes` | Pass, 1 test |
| `best-score` | Pass, 1 test |
| `frame-rate-target` | Pass, 1 test |
| `free-play` | Pass, 1 test |

Each claim ID appears exactly once in the browser test source. No listed claim test failed. Findings F-1-1 through F-1-9 are claim-like statements outside the tested registry, so claim coverage is not complete.

## Earlier findings checked from scratch

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read every committed version of `.factory/handoff.md` and both verification reports because the handoff incorporates their findings.

| Earlier ID | Current result | Evidence |
|---|---:|---|
| `B-01` demo action used real storage | Fixed | Landing click showed banner/title and isolated writes to `demo:daily-v1` |
| `B-02` mobile first screen hid product | Fixed | At 390×844, h1 y=98 and live canvas y=540 on `/`; demo canvas ends at y=840 |
| `B-03` incomplete claims registry | **Regressed / blocking** | All 13 listed tests pass, but F-1-1 through F-1-9 remain unlisted or untested |
| `H-01` run persistence absent | Fixed | `@claim:run-persistence` passed |
| `H-02` sound not restored or played | Fixed | `@claim:sound-setting` passed |
| `H-03` no distinct loss | Fixed | `@claim:distinct-outcomes` passed |
| `H-04` no live CSP | Fixed | Live response contains the configured CSP |
| `M-01` inaccurate “nothing is saved” banner | Fixed | Banner now says **saved only here** |
| `M-02` targets below 44 px | Fixed | Live mobile suite passed target checks |
| `M-03` pause allowed shots | Fixed | `@claim:input-methods` passed |
| `M-04` zero-length click shot | Fixed | `@claim:input-methods` passed |
| `M-05` immutable caching absent | Fixed | Hashed JS returns `max-age=31536000, immutable` |
| `M-06` unknown route returned home | Fixed | Unknown path returns HTTP 404 and designed page; F-1-10 is a separate shell/metadata defect |
| `M-07` route focus absent | Fixed | Privacy navigation and browser Back both focus the new `h1` |
| `L-01` route metadata stayed home-oriented | Fixed on valid routes | Titles, canonicals, and social titles update on `/demo`, `/privacy`, and `/terms` |
| `L-02` social card wrong size | Fixed | Live social image is 1200×630 |

## Structure, accessibility, and build checks

| Check | Result |
|---|---:|
| `/`, `/demo`, `/privacy`, `/terms` status | 200 |
| Unknown route status | 404 |
| Title pattern and ≤60 characters | Pass on all routes |
| Exactly one `h1`, one `main`, ordered headings | Pass on all checked routes |
| Meta description/canonical/OG/Twitter/favicon | Pass on product routes; fail on 404 (F-1-10) |
| Header/footer consistency | Pass on product routes; fail on 404 (F-1-10) |
| Deep links, History API, Back, route focus | Pass |
| Link crawl | Pass; all internal links returned 200 |
| Distinct visual identity | Pass; blueprint grid, drafting-paper panels, cyan path, coral bumper, and gold cup match `.factory/design.md` |
| `robots.txt` and `sitemap.xml` | Pass; sitemap lists `/`, `/demo`, `/privacy`, `/terms` |
| Response headers | Pass; CSP, HSTS, Referrer-Policy, and `nosniff` present |
| Social card | Pass; 1200×630 |
| Apple-touch asset | Pass; 180×180 SVG viewBox |
| `verify-url.sh` on live `/demo` | Pass; 200, title, lang, one h1, main, alt, labelled buttons, no console errors |
| Live Playwright suite | Pass; 16/16 |
| Axe serious/critical | Pass through the Playwright integration on all routes |
| Keyboard, focus, reduced motion, 200% text, 44 px targets | Pass through the live suite |
| `npm test` | Pass; 7/7 |
| `npm run build` | Pass; `dist/` produced |
| First-load JavaScript | Pass; 18.28 kB raw, 7.35 kB gzip |

No offline claim is made, so an offline reload test is not applicable. No AI feature is present or needed for this deterministic physics game. No provider key or third-party script is embedded.

## What would make this perfect

Resolve F-1-1 through F-1-17, update the copy audit and claim registry, then rerun every claim command separately from a fresh clone plus the full local and live browser suites. A perfect next round has no unlisted statement, no copy flag, a complete 404 shell, no redundant demo action, and a tested **Copy today’s result** path.

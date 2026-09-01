# Pinpoint Daily independent verification

## Verdict: FAIL

Candidate `63dfbde58d26fd9c492aed46f55d35f170fe68ad` was checked locally and at `https://pinpoint-daily.sociobot.in/` on 2026-09-01 UTC. The deployed HTML, JavaScript, CSS, and hero image match the production build byte for byte.

The candidate is not ready for release. The required first-screen demo action does not enter the isolated demo, the 390 px first screen hides the explanation and game below an 800 px image, and the claims registry does not test several visitor-facing promises. The deterministic game can reach its end screen, but a 15-miss run receives the same completion outcome as a three-cup run.

## Release-blocking findings

### B-01 — The one-click demo action uses the real storage namespace

Confirmed from a fresh browser context:

1. Open `/`.
2. Select **Try it with sample data**.
3. The address changes to `/demo`, but the demo banner is absent and the title remains `Pinpoint Daily — Play a daily three-hole course`.
4. Select **Sound off**.
5. The browser writes `pinpoint:daily-v1`; it does not write `demo:daily-v1`.

Directly opening `/demo` does use the demo namespace. The defect is in the required first-screen path, which the existing browser test does not exercise. This fails the one-click isolated-demo acceptance gate and can mix sample actions with ordinary local data.

### B-02 — The 390 px first screen does not show the product or explain the first action

Confirmed at 390×844 on `/demo`: the hero image is laid out at 358×800 CSS px. The headline starts at y=1064 and the playable canvas starts at y=1679. The captured first screen shows the header, demo banner, and part of the illustration, but not the headline, audience sentence, primary action, or playable game. Evidence: `evidence/live-mobile-390.png`.

This fails the explicit mobile first-read and browser-game capture gates.

### B-03 — The claims registry is incomplete and one listed test does not prove its observable claim

Confirmed `.factory/claims.json` contains only three entries. The page and README also promise local-only data handling, progress/settings persistence, a 2–4 minute session, an isolated demo, no tracking/network game requests, and fixed-step behavior. These promises have no corresponding claim entries.

The listed `five-shots` test checks `MAX_SHOTS === 5` and confirms that a second shot is rejected while the first ball is moving. It does not take five shots or confirm the observable five-shot boundary in the demo. All three listed claim tests are unit tests and do not run through the documented demo entry point.

The exact claim commands initially returned exit 127 in the untouched clone because dependencies were not installed (`vitest: not found`). After `npm ci`, all three commands passed. Under the work order's literal rule, the initial failed claim invocations are also release-blocking.

## Other findings

### High

- **H-01 — Current-run persistence is absent.** After advancing to hole 2, reload returns to hole 1 with 0/5 shots and no run state in storage. This conflicts with README copy that says progress persists and privacy copy that says the current run uses local storage. Route changes also recreate the game from hole 1.
- **H-02 — Saved sound preference is not restored in the interface.** Selecting **Sound off** changes the label to **Sound on** and stores `"sound":true`; reload shows **Sound off** while storage still says true. No audio output is implemented, so the sound control changes only text and storage.
- **H-03 — There is no distinct loss outcome.** Five misses advance each hole, and 15 misses end at **Course complete** with a local best of 15. A successful three-cup run reaches the same completion panel with 3 shots. This does not provide the required clear way to lose.
- **H-04 — The live response omits the configured Content-Security-Policy.** Root and asset responses include HSTS, Referrer-Policy, and X-Content-Type-Options, but no Content-Security-Policy header. The repository configuration declares one, so the live deployment does not apply the documented header set.

### Medium

- **M-01 — “Demo — sample data, nothing is saved” is inaccurate.** Direct demo mode stores best score, completed date, and sound preference in `demo:daily-v1`. Isolation is appropriate, but the banner's absolute storage promise is false and unlisted in the claims registry.
- **M-02 — Several mobile targets are smaller than 44 px.** At 390 px, the wordmark is 24 px high, navigation links are 21 px high, and the two demo controls are 34 px high.
- **M-03 — Pause does not prevent shot input.** After selecting **Pause**, pressing Enter increments the counter to 1/5 and changes status to “Ball rolling” while the pause button still says **Resume**.
- **M-04 — A click without a drag takes a shot.** A pointer down/up at the ball, with no movement, changes the counter from 0/5 to 1/5. This conflicts with the advertised drag input and makes accidental shots possible.
- **M-05 — Immutable assets are not cached as immutable.** The hashed JavaScript and CSS and the hero image all return `cache-control: public, must-revalidate, max-age=30`.
- **M-06 — Unknown routes do not reach the designed 404 page.** `/does-not-exist-qa` returns status 200 and the home page. `/404.html` exists, but normal unknown URLs do not use it.
- **M-07 — Client-side route changes do not move or announce focus.** After a route link is selected, focus is on `body`; the new `h1` is not focusable and the live announcer remains empty.

### Low

- **L-01 — Route metadata remains home-oriented.** Titles update, but canonical and social metadata do not update for `/demo`, `/privacy`, or `/terms`.
- **L-02 — The social image is 1200×800 rather than the documented 1200×630 card size.**

## Required gate results

### Claims

| Claim | Exact command after install | Result | Evidence |
|---|---|---:|---|
| Shared daily course | `npm test -- -t @claim:shared-daily-course` | Pass | 1 test passed; fixed 2026-09-01 UTC seed creates three equal hole sets |
| Visible prediction | `npm test -- -t @claim:visible-prediction` | Pass | 1 test passed; predicted point array contains more than eight points |
| Five shots | `npm test -- -t @claim:five-shots` | Command passes, proof insufficient | Checks the constant and rolling-shot rejection, not the five-shot demo boundary |

### First-read check

- Confirmed desktop first screen says what it is: **Play today’s three-hole course**.
- Confirmed it says who it is for: players seeking a fair two-minute physics puzzle rather than a word game.
- Confirmed it shows **Try it with sample data** and explains that it opens a practice course.
- Confirmed the desktop game is visible on the first screen.
- Checked 390 px mobile and confirmed the required content is below the first viewport; result fails as B-02.
- Checked the one-click demo action and confirmed it does not enter demo mode; result fails as B-01.

## Local build and automated checks

| Check | Result |
|---|---:|
| Candidate HEAD | `63dfbde58d26fd9c492aed46f55d35f170fe68ad` |
| `npm ci` | Pass; 60 packages installed; 0 audit findings |
| `npm test` | Pass; 4/4 tests |
| Type check | Pass through `tsc --noEmit` in the build script |
| Lint | Not available; no lint script or configuration is present |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 3/3 existing Playwright tests |
| Axe serious/critical | Pass; none on live home/demo check |
| Console and page errors | Pass; none observed |

The existing browser suite confirms direct `/demo`, one keyboard shot, basic mobile visibility, same-origin requests, and axe results. It does not select the landing-page demo action, finish a run, reload progress/settings, or check the mobile first viewport.

## End-to-end game checks

- Confirmed the goal and instructions are visible on desktop: aim, inspect the dotted path, and finish three holes within five shots per hole.
- Confirmed pointer, keyboard, and labelled on-screen controls can take a shot.
- Confirmed a second shot is rejected while the ball is moving.
- Confirmed deterministic UTC seed generation and fixed-step simulation through unit tests.
- Confirmed a scripted winning live run reaches cups on holes 1–3 and shows **Course complete** in 3 shots.
- Confirmed a scripted five-miss-per-hole live run advances through all three holes and shows **Course complete** in 15 shots.
- Confirmed **Play again** resets to hole 1, 0/5 shots, hides the result, and retains the saved best score.
- Confirmed the persistence, pause, click-without-drag, and loss-outcome defects listed above.
- Measured 121 animation frames over 2016.6 ms, or 60.002 frames per second, in headless desktop Chromium. This confirms the measured environment only; there is no mid-range-phone frame-rate claim test.

## Privacy, network, and headers

- Confirmed the full checked flow requested only the product origin: HTML, hashed JavaScript, hashed CSS, hero image, and product routes. No third-party requests, analytics, or page errors were observed.
- Confirmed `/privacy` and `/terms` return 200 and each has one `h1` and one `main`.
- Confirmed the live deployment has no server-side product endpoint, sign-in, payment, or product-unlock call. Rate-limit and identity-provider checks are not applicable.
- Confirmed this is not a PWA and makes no offline claim; service-worker update/offline checks are not applicable.
- Confirmed HSTS, Referrer-Policy, and X-Content-Type-Options are present. Checked that CSP is absent as H-04.

## Performance and asset identity

- Live and local SHA-256 values match for `index-DwnoeD7l.js`, `index-D3OqcRuI.css`, and `hero-blueprint.webp`.
- Production sizes: JavaScript 14.29 KB raw / 5.79 KB gzip; CSS 5.87 KB raw / 1.99 KB gzip; hero image 81.67 KB. These pass the bundle budgets.
- Lighthouse 12.8.2 mobile result: performance 100, accessibility 100, best practices 100, SEO 100; FCP 934 ms, LCP 1301 ms, CLS 0, TBT 86 ms.
- Confirmed reduced-motion matching is active and computed scroll behavior becomes `auto`; animations/transitions are reduced to 0.01 ms.

## Evidence

- `evidence/live-first-screen-desktop.png`
- `evidence/live-mobile-390.png`
- `evidence/live-end-screen.png`
- `evidence/local-end-screen.png`
- `evidence/live-root-headers.txt`
- `evidence/live-js-headers.txt`
- `evidence/live-css-headers.txt`
- `evidence/live-hero-headers.txt`
- `evidence/lighthouse-live.json`

No product source was modified during verification.

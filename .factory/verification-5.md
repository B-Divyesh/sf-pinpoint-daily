# Pinpoint Daily independent verification 5

## Verdict: FAIL

Candidate `38732ea27c3bd19ee23c5c0060ddae7ef0f27b4c` was independently verified on 2026-09-02 UTC from a clean checkout and against [https://pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in).

The game, production build, and deployment work end to end. All 18 registered claim commands pass after the required clean install, both full browser suites pass 20/20, and independent scripted runs reach the real win and loss screens. The candidate is still not release-ready because its data-removal control is misleading and destructive, and two live action promises are absent from the claims manifest.

No product code, deployment, infrastructure, DNS, secrets, or other product resources were changed.

## Release-blocking findings

### B-01 — The advertised data-removal path is incomplete, misleading, and irreversible

The privacy route lists the current run, completed dates, sound setting, and best score under **What is stored**. Under **How to remove it**, it instructs the player to use **Clear local score** or clear all site data. The in-game button does not remove all of that stored data:

1. In a fresh `/demo` context, storage was seeded with best score `3`, completed date `20260901`, sound `true`, and a current run.
2. Selecting **Clear local score** displayed no confirmation and offered no undo.
3. The resulting `demo:daily-v1` value had `best: null` and `completed: []`, but retained `sound: true` and the complete current run.

The label says it clears one score, but the action also irreversibly deletes completed-date history. Conversely, the privacy copy presents it as a removal route for all listed data, but the action leaves two categories behind. This violates the privacy instructions and the requirement that destructive actions be confirmed with specifics or reversible.

There is no claim entry for this public removal instruction, and no test selects **Clear local score**. Required fix: make the action and privacy wording describe the same exact storage boundary, add a confirmation or undo, and register one tagged claim test that proves every key retained and removed.

### B-02 — The demo's primary-action promise is not registered as a claim

The `/demo` first screen says **“Moves focus to the demo course.”** beside **Play the sample course**. The behavior currently works: activating it focuses the course heading. However, `.factory/claims.json` has no matching claim. The check is only in the untagged `390x844 first screen contains the explanation, action, and playable board` browser test, so none of the 18 exact claim commands selects it as its own registered promise.

The claims contract requires every visitor-reliant statement to have one manifest entry and one matching tagged test. Required fix: register and tag this behavior, or remove the promise.

## First-read gate: PASS

Cold 1440×900 and 390×844 production loads show the game itself rather than a menu wall.

- What it does: **Play today’s three-hole course**.
- For whom: players who want a short physics puzzle with one shared course each day.
- What to do first: **Try it with sample data**, followed by **Opens a demo course in separate storage**.
- At 390 px, the playable canvas begins at y=540.47 within the 844 px first viewport; horizontal overflow is `0`.
- One click opens `/demo`, shows the persistent sample-data banner, and leaves a seeded `pinpoint:daily-v1` value byte-for-byte unchanged.

## Registered claims

The untouched clone did not include `node_modules`, so the mandatory pre-install command probe stopped before test discovery with missing `@playwright/test`. After `npm ci`, which is the repository's required clean-install step, every exact command in `.factory/claims.json` was run independently through the demo entry point and passed.

| Claim ID | Result | Independent proof review |
|---|---:|---|
| `demo-isolation` | Pass | Real storage remained unchanged through demo entry, play, and reset. |
| `shared-daily-course` | Pass | Fixed UTC contexts reported the same seed and board. |
| `visible-prediction` | Pass | Dotted-path pixels were measured before play and removed while paused. |
| `visible-course-elements` | Pass | Walls, moving bumper, and wind were measured. |
| `five-shot-limit` | Pass | Five misses advanced the hole and reset its counter. |
| `run-persistence` | Pass | Hole and shot state survived reload. |
| `sound-setting` | Pass | A recorded Web Audio fixture observed tones and persisted the setting. |
| `local-privacy` | Pass | The demo/play/legal request log was same-origin only and set no cookies. |
| `input-methods` | Pass | Pointer, keyboard, labelled controls, pause, reset, and invalid zero-drag behavior were exercised. |
| `distinct-outcomes` | Pass | Deterministic win and 15-miss loss reached different result screens. |
| `best-score` | Pass | A winning best of 3 survived reload. |
| `restart-reset` | Pass | Play again reset run state and retained saved progress/settings. |
| `completed-date-persistence` | Pass | `20260901` survived completion and reload. |
| `result-sharing` | Pass | Exact win and loss result text was copied without geometry. |
| `frame-rate-target` | Pass | The suite measured 55–65 fps and the 60 Hz marker. |
| `free-play` | Pass | Play was available without account or payment controls. |
| `generated-artwork` | Pass | Every route disclosed it; the served asset matched recorded provenance bytes. |
| `static-deploy` | Pass | Production-style routes, metadata, headers, focus, and 404 behavior passed. |

B-01 and B-02 concern public promises missing from this otherwise passing registry.

## Build and automated checks

| Check | Result |
|---|---:|
| Candidate HEAD before verification | `38732ea27c3bd19ee23c5c0060ddae7ef0f27b4c` |
| `npm ci` | Pass; 60 packages installed, 0 vulnerabilities |
| `npm audit --omit=dev` | Pass; 0 vulnerabilities |
| `npm test` | Pass; 10/10 |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 20/20 local |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | Pass; 20/20 live |
| `/opt/fleet/lib/verify-url.sh .../demo` | Pass after creating its required output directory; 596 ms, no errors |

Production bundle sizes are 20,338 bytes JS (7.86 kB gzip), 7,142 bytes CSS (2.29 kB gzip), 81,670 bytes for the hero, and 67,958 bytes for the social card. These are within the static-product budgets.

## Independent game run and recovery evidence

- A three-shot pointer run advanced through holes 2 and 3 and reached **Course complete — you won** with 3/3 cups. It saved best `3`, completed date `20260901`, and copied `Pinpoint Daily 2026-09-01 — 3/3 cups in 3 shots`.
- A separate run used all 15 misses and reached **Course over — try again** with 0/3 cups. **Play again** reset hole, shots, and cups to zero while retaining the sound setting.
- Pause blocked shooting, a zero-length pointer action used no shot, Arrow keys adjusted aim/power, Enter fired, and R reset the ball while retaining used shots.
- A real CDP touch drag at 390×844 changed the counter to `Shots: 1 / 5`, announced that the ball was rolling, and persisted one shot.
- Malformed demo localStorage recovered to hole 1 with zero shots, accepted a shot, and rewrote valid JSON without a page error.
- The UTC boundary changed seed `20260902` to `20260903`; the rendered board hashes differed.
- During active play at 390×844 with 4× CPU throttling, 120 animation-frame intervals measured **59.51 fps** and the game exposed simulation rate `60`.

## Accessibility, privacy, routing, and performance

- Independent Axe scans found zero serious/critical violations on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404.
- Every visible link, button, and focusable canvas on those routes measured at least 44×44 CSS px at 390 px.
- Keyboard-only use starts on a 121.66×44 px skip link with a visible 3 px gold outline. Enter focuses `<main>`. Client navigation focuses the new `<h1>` and updates the polite route announcement.
- Reduced motion reported true and changed smooth scrolling to `auto`. At 200% root text size, horizontal overflow remained zero and controls remained available.
- Valid routes produced no console or page errors. The expected HTTP 404 navigation produces Chromium's normal failed-resource console message for that document.
- Full play and navigation sent no third-party requests and set no cookies. The observed origins were exclusively `https://pinpoint-daily.sociobot.in`.
- Documents return CSP with self-only scripts/connections and `frame-ancestors 'none'`, HSTS, `nosniff`, and strict-origin referrer policy. HTML and fixed-name images revalidate after 30 seconds; hashed JS/CSS are immutable for one year.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns the styled 404. All crawled internal links return 200.
- Route-specific titles, descriptions, and canonicals are correct. The social image is 1200×630.
- Fresh live mobile Lighthouse: Performance **95**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.3 s, TBT 250 ms, CLS 0, 91 KiB transferred.

## Deployment identity

Fresh `dist/` and production matched byte-for-byte for all checked release files:

| File | SHA-256 |
|---|---|
| `index.html` | `29904aa82e64942747ef1ba465d0dc2c5252788bb44169b0715447b75eb936bd` |
| `assets/index-ZrIYIljh.js` | `b2629aff0dd0557ce4fff26f1a96fefd924430c9a9965483005bca95ee6f41a4` |
| `assets/index-C2kPxl9f.css` | `d9142574f61b7d42ec503967b86ce8dfdf6adc36a96b5a2dee4dbad272e7951b` |
| `hero-blueprint.webp` | `27141e9371500729525a0d53465b74eae496e13ec4c956d208eae693faa3ec70` |
| `social-card.webp` | `ee7ad8037b38be19546b27fab0f53c08158ee7816ff7f5015b45565fe11a88a3` |
| `404.html` | `2940745cf3182fed3d6ba6c16e44ad11827f559dba1d7105f9050a1cb6558bef` |
| `404.css` | `f361166e39587c076f932918f306cab12ac3061000c37fdf818f0f383c2e9419` |
| `robots.txt` | `8671cc0e14f47277308dd0c94d61ac91af44f266b8b0bf1bbd4a3b86a2175cb6` |
| `sitemap.xml` | `0e2688dc179ec6e729a651e5a69f3e7d433297c652443237e4fd6f830a30e72f` |

## Scope notes

This is a static local-first browser game. It has no backend endpoints, product-unlock call, authentication, payment, service worker, offline claim, library package, or CLI surface. Rate-limit, Entra, PWA-update/offline, and package-consumer checks do not apply. No prohibited resource or service was accessed.

## Defects by severity

- Release-blocking: B-01 misleading/incomplete irreversible data removal; B-02 unregistered demo focus promise.
- High: none beyond the release blockers.
- Medium: none separately recorded.
- Low: none.

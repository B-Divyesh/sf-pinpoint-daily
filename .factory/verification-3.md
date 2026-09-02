# Pinpoint Daily independent verification 3

## Verdict: FAIL

Candidate `1ddafeafb2e3285c9c2098b518ddaf2b49824d0a` was independently verified on 2026-09-02 UTC from a clean checkout and against [https://pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in).

The product, production build, and deployed game work end to end. All 16 registered claim commands pass, but two tagged tests do not prove every part of their claim. The mobile site also has interactive links below the 44×44 CSS pixel minimum. These violate the attached claims and accessibility contracts, so the candidate is not release-ready.

No product code, deployment, infrastructure, DNS, secrets, or other product resources were changed.

## Release-blocking findings

### B-01 — The input-methods claim test never performs a successful drag shot

`.factory/claims.json` says the game supports drag, keyboard, labelled on-screen controls, and pause. Its required command passes, but the one test tagged `@claim:input-methods` only performs a zero-length pointer click and confirms that it does not shoot. The successful shots in that test use the keyboard and the on-screen Shoot button (`tests/app.e2e.ts`, lines 181–200).

The separate outcome test happens to use pointer dragging, but it is not selected by `npm run test:browser -- --grep @claim:input-methods`. The exact registered claim command therefore does not prove successful drag input as required by the claims contract.

Required fix: make a non-zero drag in the tagged input-methods test and assert the shot count and rolling state change.

### B-02 — The visible-course-elements claim test never asserts that walls are visible

The registered claim is “Wind, walls, and the moving bumper are visible during play.” The tagged test measures coral pixels for the moving bumper and checks the wind label, but it has no wall assertion (`tests/app.e2e.ts`, lines 97–123). Its sandbox description also omits a wall check.

The walls are visibly present in manual play, but every part of a registered claim must be proven by its exact sandbox test. The passing command is incomplete.

Required fix: add an observable wall-rendering assertion to the tagged test and describe it in the claim sandbox.

## Other defects

### Medium — Mobile touch targets below 44 px

At a 390×844 viewport, these visible links are below the required 44×44 CSS pixel target:

- Footer **Privacy**: 47.08×19.5 px on `/`, `/demo`, `/privacy`, `/terms`, and the 404 page.
- Footer **Terms**: 38.30×19.5 px on the same routes.
- **Return to today’s course**: 196.81×19 px on `/privacy` and `/terms`.

The authored mobile test only measures elements whose top edge is inside the first viewport, so it misses these controls farther down the page. The links work, but their tap areas fail the attached accessibility baseline.

### Low — Generated imagery is not disclosed on the public site

The hero is recorded as generated with the `factory-image` deployment in `.factory/design.md` and `assets/src/hero-blueprint.png.json`. No live footer or page discloses that generated imagery is used. This misses the attached image-generation disclosure requirement.

### Low — Fixed-name images are cached as immutable for one year

`hero-blueprint.webp` and `social-card.webp` use stable filenames, while `/*.webp` receives `Cache-Control: public, max-age=31536000, immutable`. A future deployment that replaces either file at the same URL can remain stale for returning browsers for up to one year. The immutable policy should be limited to content-hashed URLs or the image filenames should be versioned.

## First-read gate: PASS

The cold 1440×900 and 390×844 first screens show the game itself, not a menu wall.

- What it does: **“Play today’s three-hole course.”**
- For whom: **“For players who want a short physics puzzle with one shared course each day.”**
- First action: **“Try it with sample data,”** followed by **“Opens a demo course in separate storage.”**
- The game board is visible in the first viewport at both sizes.
- One click enters `/demo`, changes the title to `Demo — Pinpoint Daily`, and shows **“Demo — sample data, saved only here.”**
- A seeded ordinary value in `pinpoint:daily-v1` stayed byte-for-byte unchanged during demo play and reset.

## Registered claims

`npm ci` ran first in the clean checkout: 60 packages installed and 0 audit vulnerabilities. Every exact command in `.factory/claims.json` then passed independently.

| Claim ID | Command result | Proof review |
|---|---:|---|
| `demo-isolation` | Pass | Adequate |
| `shared-daily-course` | Pass | Adequate |
| `visible-prediction` | Pass | Adequate |
| `visible-course-elements` | Pass | **Incomplete: no wall assertion (B-02)** |
| `five-shot-limit` | Pass | Adequate |
| `run-persistence` | Pass | Adequate |
| `sound-setting` | Pass | Adequate |
| `local-privacy` | Pass | Adequate with independent request-log review |
| `input-methods` | Pass | **Incomplete: no successful drag (B-01)** |
| `distinct-outcomes` | Pass | Adequate |
| `best-score` | Pass | Adequate |
| `completed-date-persistence` | Pass | Adequate |
| `result-sharing` | Pass | Adequate |
| `frame-rate-target` | Pass | Adequate; independently measured |
| `free-play` | Pass | Adequate |
| `static-deploy` | Pass | Adequate |

Each claim ID appears exactly once in the browser test source.

## Build and automated checks

| Check | Result |
|---|---:|
| Candidate HEAD | `1ddafeafb2e3285c9c2098b518ddaf2b49824d0a` |
| `npm ci` | Pass; 60 packages, 0 vulnerabilities |
| `npm test` | Pass; 8/8 |
| `npm run lint` | Pass (`tsc --noEmit`) |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 17/17 locally |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | Pass; 17/17 live |
| `/opt/fleet/lib/verify-url.sh .../demo` | Pass |
| Axe on `/`, `/demo`, `/privacy`, `/terms`, and 404 | 0 violations at any severity |

Production output is small: JavaScript 20.19 kB raw / 7.81 kB gzip, CSS 7.03 kB raw / 2.28 kB gzip, hero 81.67 kB, and total first-load transfer measured by Lighthouse was 93.48 kB.

Mobile Lighthouse on `/demo` scored Performance 99, Accessibility 100, Best Practices 100, and SEO 100. FCP was 761 ms, LCP 1,207 ms, CLS 0, and TBT 127 ms. Desktop scores were 100 in all four categories.

## End-to-end game evidence

- Starting cold at `/`, the first-screen action entered the fixed sample course.
- Three deterministic pointer drags reached **“Course complete — you won”** with 3/3 cups in 3 shots.
- The win stored best `3`, completed date `20260901`, and the enabled sound preference in `demo:daily-v1`.
- Reload restored the completed win. **Play again** reset to hole 1, shots 0/5, and cups 0/3 while retaining sound.
- A separate fifteen-miss run reached **“Course over — try again”** with 0/3 cups.
- The five-shot boundary, pause blocking, zero-length pointer input, minimum power, corrupted-localStorage recovery, reload recovery, clipboard fallback, and demo reset all worked.
- Keyboard-only Tab navigation reached the canvas in document order. Every focused link, button, and canvas showed a 3 px gold outline; arrows plus Enter took a shot.
- A fresh 390×844 page under 4× CPU throttling exposed the 60 Hz simulation marker and measured 59.50 rendered frames per second over 120 frames.

## Privacy, routes, and deployment

- The observed browser request log contained only the product origin: HTML, hashed JavaScript, hashed CSS, and the hero image. There were no cookies, console errors, or page errors.
- CSP restricts default, script, style, and connections to self and sets `frame-ancestors 'none'`. HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff` are present.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. Unknown routes return the designed 404. All internal product links resolve as intended.
- Documents use a 30-second revalidating cache and return 304 with their ETag. JavaScript and CSS are cached for one year as immutable.
- Fresh `dist/` files and live files have matching SHA-256 hashes for `index.html`, `index-CV20OVeV.js`, `index-BI4ABKPG.css`, and `hero-blueprint.webp`. The live deployment is the tested candidate.
- The product is a static, local-only browser game with no server endpoint, sign-in, payment, product-unlock call, service worker, or offline claim. API rate-limit, Entra, backend concurrency, and PWA update checks do not apply.

## Scope

Only the assigned repository, the public Pinpoint Daily URL, and local test processes were inspected. No prohibited service, other product resource, infrastructure, DNS, billing, secret, or external storage was accessed.

# Pinpoint Daily independent verification 4

## Verdict: FAIL

Candidate `a0cfa5ed0b2af93137ad8cb6272b5b1d173287ef` was independently verified on 2026-09-02 UTC from a clean checkout and against [https://pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in).

The game and deployment work end to end. All 16 registered claim commands pass after `npm ci`, the full local and live browser suites pass 19/19, and a separate deterministic live run reaches both real end states. The candidate nevertheless fails the attached claims and game-loop acceptance contract because required and advertised behavior is missing from the claims manifest or is not proved by its exact registered test.

No product code, deployment, infrastructure, DNS, secrets, or other product resources were changed.

## Release-blocking findings

### B-01 — Restart reset has no registered claim or tagged claim test

The game-loop contract requires a claim for “restart resets state.” The live win and loss screens advertise **Play again**, but `.factory/claims.json` has no restart/reset claim and no test is tagged for it. The `@claim:distinct-outcomes` test reaches the result screens but never activates **Play again**.

Independent black-box play confirmed that **Play again** currently resets to hole 1, 0/5 shots, and 0/3 cups while retaining the sound preference. Runtime behavior is good, but the mandatory claims gate cannot prove it from the demo entry point.

Required fix: add a `restart-reset` manifest entry and one matching `@claim:restart-reset` test that reaches a real end screen, activates **Play again**, asserts a fresh run, and verifies the intended persistence boundary for settings and best/completed progress.

### B-02 — Advertised keyboard controls exceed the registered input proof

README advertises: “Arrow keys set aim and power. Enter shoots. R resets the current hole. Escape pauses or resumes.” The exact `@claim:input-methods` test proves Escape, ArrowRight, Enter, pointer drag, and labelled controls, but never uses ArrowUp/ArrowDown or `R`. Those public, user-reliant behaviors are therefore unlisted/unproved under the claims contract.

Required fix: make the manifest claim and sandbox name all advertised keyboard operations, then have its single tagged test prove keyboard power adjustment and `R` reset through observable state or UI feedback.

### B-03 — Generated-artwork disclosure is an unlisted public claim

Every live route says “Blueprint artwork is generated for Pinpoint Daily.” A separate browser test checks that the sentence is present, but it has no claim tag and `.factory/claims.json` has no matching entry. The claims contract says any claim-like landing/README sentence not listed in the manifest fails review.

Required fix: register the disclosure and tag its existing test, with evidence that ties the shipped asset to the recorded provenance, or remove the public claim if it is not intended to be asserted.

## Other finding

### Low — Copy audit omits current footer copy

`.factory/copy-audit.md` does not include the generated-artwork footer sentence now shown on every route. Its listed copy otherwise meets the 22-word and banned-word checks.

## First-read gate: PASS

The cold 1440×900 and 390×844 live pages show the game itself, not a menu wall.

- What it does: **“Play today’s three-hole course.”**
- For whom: **“For players who want a short physics puzzle with one shared course each day.”**
- What to click first: **“Try it with sample data,”** followed by **“Opens a demo course in separate storage.”**
- One click opens `/demo`; its persistent banner says **“Demo — sample data, saved only here.”**
- At 390×844 the complete board is visible in the first viewport with no horizontal overflow.

## Registered claims

`npm ci` installed 60 packages with 0 audit vulnerabilities. Every exact command recorded in `.factory/claims.json` then passed independently.

| Claim ID | Exact command result | Proof review |
|---|---:|---|
| `demo-isolation` | Pass | Adequate |
| `shared-daily-course` | Pass | Adequate |
| `visible-prediction` | Pass | Adequate |
| `visible-course-elements` | Pass | Adequate; walls, bumper movement, and wind are all measured |
| `five-shot-limit` | Pass | Adequate |
| `run-persistence` | Pass | Adequate |
| `sound-setting` | Pass | Adequate |
| `local-privacy` | Pass | Adequate with independent live request-log review |
| `input-methods` | Pass | Incomplete for advertised ArrowUp/ArrowDown and `R` behavior (B-02) |
| `distinct-outcomes` | Pass | Adequate |
| `best-score` | Pass | Adequate |
| `completed-date-persistence` | Pass | Adequate |
| `result-sharing` | Pass | Adequate |
| `frame-rate-target` | Pass | Adequate and independently measured during active play |
| `free-play` | Pass | Adequate |
| `static-deploy` | Pass | Adequate |

Each registered claim ID appears exactly once in `tests/app.e2e.ts`. B-01 and B-03 concern missing manifest entries, not duplicate tags or a failure of the 16 existing commands.

## Build and automated checks

| Check | Result |
|---|---:|
| Candidate HEAD | `a0cfa5ed0b2af93137ad8cb6272b5b1d173287ef` |
| `npm ci` | Pass; 60 packages, 0 vulnerabilities |
| `npm test` | Pass; 8/8 |
| `npm run lint` | Pass (`tsc --noEmit`) |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 19/19 locally |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | Pass; 19/19 live |
| `/opt/fleet/lib/verify-url.sh .../demo` | Pass; 681 ms, no console/page errors |
| Independent Axe, 5 routes × desktop/mobile | 0 violations at any severity |

Fresh production output is small: JavaScript 20.27 kB raw / 7.84 kB gzip, CSS 7.14 kB raw / 2.29 kB gzip, and the hero image 81.67 kB. Mobile Lighthouse on `/demo` scored 100 for Performance, Accessibility, Best Practices, and SEO. FCP was 758 ms, LCP 1,202 ms, CLS 0, TBT 57 ms, and total transfer was 93,551 bytes.

Evidence is retained in `.factory/evidence/verification-4-live/`.

## End-to-end game evidence

- A separate live 390 px script started at `/`, selected **Try it with sample data**, and played three deterministic pointer-drag shots.
- It reached **“Course complete — you won”** with 3/3 cups in 3 shots. Demo storage recorded best `3`, completed date `20260901`, and sound `true`.
- Reload restored the finished win and sound setting. **Play again** reset hole, shot, and cup counters while retaining sound.
- A separate fifteen-miss run reached **“Course over — try again”** with 0/3 cups and 15 total shots.
- The registered boundary test proves exactly five misses advance the hole and a sixth shot cannot be taken on that hole.
- Zero-length drag, shots while paused, clipboard denial fallback, malformed JSON storage recovery, and demo reset recover without console errors.
- Keyboard-only navigation reaches the skip link, sample action, and canvas in order. Focus uses a visible 3 px gold outline. ArrowRight plus Enter takes a shot.
- A real touch sequence at 390 px takes a drag shot and reports **“Ball rolling. Watch the bounce.”**
- During an active shot at 390×844 with 4× CPU throttling, the independent measurement observed the 60 Hz simulation marker and 60 rendered frames per second over 120 frames.

The goal, challenge, win/loss conditions, daily/demo modes, pointer/touch controls, pause, persistence, and restart behavior all function. The verdict is caused by mandatory proof coverage, not a failure to reach the real end screen.

## Accessibility, privacy, and deployment

- Independent Axe scans on `/`, `/demo`, `/privacy`, `/terms`, and a 404 route at 1440 px and 390 px found zero violations.
- The skip link is first in keyboard order and moves focus to `main`. SPA route changes focus the new h1. All tested public targets are at least 44×44 CSS pixels; 200% text and reduced motion remain usable.
- The Playwright request log during demo play and legal-page navigation contained only four same-origin GETs: document, hashed JS, hashed CSS, and hero image. There were no failed requests or cookies.
- Browser response headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`.
- Documents and the stable-name hero use `public, must-revalidate, max-age=30`; a conditional document request returned 304. Hashed JS/CSS use one-year immutable caching.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. Unknown routes return the designed 404. All ordinary product links resolve; `robots.txt`, `sitemap.xml`, icons, and social artwork return 200.
- Fresh `dist/` and live files are byte-for-byte identical for `index.html`, `index-CUtenSYd.js`, `index-C2kPxl9f.css`, and `hero-blueprint.webp`. The deployed product matches the candidate.
- This is a static, local-only browser game. It has no API/product-unlock endpoint, sign-in, payment, service worker, or offline claim, so rate-limit, Entra, backend concurrency, and PWA update checks do not apply.

## Scope

Only the assigned repository, the public Pinpoint Daily URL, and local test processes were inspected. No prohibited service, other product resource, infrastructure, DNS, billing, secret, or external storage was accessed.

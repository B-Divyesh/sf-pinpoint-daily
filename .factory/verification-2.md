# Pinpoint Daily independent verification 2

## Verdict: PASS

Candidate `7c4623d082bb012b67a3b4b7c6f6d829710b7219` was independently verified on 2026-09-01 UTC from a clean checkout and against [https://pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in). This supersedes the earlier failed report in `verification.md`: its listed blockers are fixed in this candidate and the deployed bytes match the candidate build.

No release-blocking, high, medium, or low defects were found.

## First read

Cold desktop load shows the playable page, rather than a menu wall. It says **“Play today’s three-hole course”**, identifies the audience as players wanting a short shared physics puzzle, and offers one visible **“Try it with sample data”** action with the result (“Opens a practice course in separate demo storage”). The live canvas is already present in the first screen. At 390×844 the explanation, action, visible board, ball, dotted path, and controls are all in the first viewport.

Clicking the action changed the route to `/demo`, changed the title to `Demo — Pinpoint Daily`, displayed **“Demo — sample data, saved only here”** with Reset demo and Start for real, and used the `demo:daily-v1` namespace without reading or changing `pinpoint:daily-v1`.

## Required claim tests — all pass

`npm ci` was run first in the clean checkout (60 packages, 0 audit vulnerabilities). Every exact command in `.factory/claims.json` was then run separately through the browser demo entry point; all 13 passed:

| Claim ID | Result |
|---|---:|
| `demo-isolation` | Pass |
| `shared-daily-course` | Pass |
| `visible-prediction` | Pass |
| `visible-course-elements` | Pass |
| `five-shot-limit` | Pass |
| `run-persistence` | Pass |
| `sound-setting` | Pass |
| `local-privacy` | Pass |
| `input-methods` | Pass |
| `distinct-outcomes` | Pass |
| `best-score` | Pass |
| `frame-rate-target` | Pass |
| `free-play` | Pass |

The full suites also passed:

| Check | Result |
|---|---:|
| `npm test` | 7/7 passed |
| `npm run test:browser` | 16/16 passed locally |
| `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` | 16/16 passed live |
| `npm run lint` | Pass (`tsc --noEmit`) |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; `dist/` produced |

## End-to-end game evidence

- A deterministic title-to-play run through `/demo` reached **Course complete — you won** after sinking all three cups. The saved run recorded `outcome: "won"`, 3 cups, and the persistent local best.
- A separate 15-miss run reached **Course over — try again** with “You sank 0 of 3 cups.” Selecting **Play again** reset Hole 1, shots 0/5, cups 0/3, and removed the result while retaining the saved settings/best score.
- The normal path, five-shot boundary, pointer drag, ignored zero-length pointer input, keyboard arrows/Enter, labelled on-screen controls, pause/resume, sound preference, reload restoration, and demo reset all passed in the live browser suite.
- At 390×844 under 4× CPU throttling, the game exposed `data-simulation-hz="60"` and measured **60.003 rendered fps** across 120 animation-frame intervals.

## Accessibility, privacy, and deployment

- Live Axe checks on `/`, `/demo`, `/privacy`, `/terms`, and a 404 route reported **zero serious or critical violations**. Valid product routes produced no console or page errors.
- `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo /tmp/pinpoint-verify-url` passed: HTTP 200, title, `lang=en`, exactly one `h1`, `<main>`, image alt text, and labelled buttons.
- Keyboard operation passed; the initial Skip to game focus ring is a visible 3 px gold outline. At 390 px no visible interactive target was smaller than 44 px. Reduced motion set scroll behavior to `auto`, and 200% text caused no horizontal overflow.
- The complete Playwright request log (home → demo → play → legal pages) contained only `https://pinpoint-daily.sociobot.in` requests and no cookies. There are no accounts, analytics, ads, payment, or third-party game requests.
- Browser responses carry CSP (`default-src 'self'` with `connect-src 'self'`), HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. Documents are short-cacheable (`max-age=30`); hashed JS/CSS and the hero use `max-age=31536000, immutable`. `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown route returned the designed HTTP 404.
- This static, local-only browser game has no backend endpoints, authentication, payment, service worker, or offline claim, so rate-limit, Entra, PWA-update, and consumer-package checks do not apply.

## Performance and identity

- Production build: JS 18.28 kB raw / **7.35 kB gzip**, CSS 6.64 kB raw / **2.18 kB gzip**, hero 81.67 kB. These are within the static-game budgets.
- Fresh mobile Lighthouse on `/demo`: Performance **94**, Accessibility **100**, Best Practices **100**, SEO **92**. (The scoring run completed with a post-capture headless Chromium target-crash warning; the scored report was written successfully.)
- SHA-256 comparisons between fresh `dist/` and production matched byte-for-byte for `index.html`, hashed JS, hashed CSS, `hero-blueprint.webp`, `404.html`, `404.css`, `robots.txt`, and `sitemap.xml`. This confirms the live deployment is this candidate’s build.

## Defects by severity

None found.

## Scope notes

The URL is static content; inspecting product source/build output and its public responses was sufficient. No prohibited services, other products, infrastructure, DNS, billing, secrets, or external state were accessed.

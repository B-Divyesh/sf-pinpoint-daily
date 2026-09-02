# Independent verification 7 — PASS

**Candidate:** `5bddd5225d57cbaf9e15b674fc4290c43ebfcfdd`
**Live URL:** https://pinpoint-daily.sociobot.in
**Verified:** 2026-09-02 UTC
**Result:** **PASS** — no critical, high, medium, or low defects found.

## Mandatory release gates

### Claims: PASS (19/19)

The checkout was clean and exactly at the candidate commit before testing. After `npm ci`, I ran every `test` command in `.factory/claims.json` separately. All 19 exited 0:

- `demo-isolation`, `demo-focus`, `shared-daily-course`, `visible-prediction`
- `visible-course-elements`, `five-shot-limit`, `run-persistence`, `sound-setting`
- `local-privacy`, `input-methods`, `distinct-outcomes`, `best-score`
- `restart-reset`, `completed-date-persistence`, `clear-local-score-history`
- `result-sharing`, `frame-rate-target`, `free-play`, `static-deploy`

The registry test also proves that every registered claim has exactly one matching test tag. I cross-checked the live copy and README; no unregistered product or privacy claim remains. Evidence: `evidence/verification-7/claim-summary.txt`.

### Cold first read and one-click demo: PASS

On a fresh live load, the first screen says:

- What it does: **“Play today’s three-hole course.”**
- Who it is for: **“For players who want a short physics puzzle with one shared course each day.”**
- What to click first: **“Try it with sample data,”** with adjacent text saying it opens separate demo storage.

That one click opens `/demo`. The desktop capture shows the live course beginning in the viewport; at 390×844 the complete game canvas is visible at y=633–840, so this is the game itself rather than a menu wall. Evidence: `evidence/verification-7/live-first-read-desktop.png`, `live-first-read-mobile.png`, and `live-demo-mobile.png`.

## Clean candidate checks

All required local checks passed:

```text
npm ci                 PASS (60 packages; 0 vulnerabilities)
npm run lint           PASS
npm run typecheck      PASS
npm test               PASS (10/10)
npm run build          PASS; dist/ produced
npm run test:browser   PASS (21/21 against local production host)
```

The exact production output is 21,416 B JavaScript (8.12 KB gzip), 7,623 B CSS (2.40 KB gzip), and 81,670 B for the only first-screen raster image. This is well inside the 200 KB JS, 50 KB CSS, 300 KB hero, and 2 MB casual-game asset budgets.

## Live deployment identity and routes

`PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` passed 21/21.

All 11 browser-served build artifacts matched the local candidate `dist/` byte-for-byte: HTML, hashed JavaScript and CSS, 404 HTML/CSS, both icons, hero, social card, robots, and sitemap. Candidate commits after deployed app commit `14e1791` change only `.factory` evidence/documentation, so the live executable and public assets match candidate `5bddd52`. Exact hashes are in `evidence/verification-7/deployment-match.txt`.

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200.
- Unknown route: HTTP 404 with the byte-identical designed `404.html`.
- Every navigational link resolves successfully; see `evidence/verification-7/link-crawl.txt`.
- HTTP redirects to HTTPS.
- HTML cache: `public, must-revalidate, max-age=30`.
- Hashed JS/CSS cache: `public, max-age=31536000, immutable`.
- Unhashed hero cache: short revalidation, appropriate for a mutable URL.

## Independent game play

I ran the deterministic sample from the landing page through active play to both real end states:

| Scenario | Result |
|---|---|
| Three pointer-drag shots | **Course complete — you won**; 3/3 cups in 3 shots |
| Five misses on each hole | **Course over — try again**; 0/3 cups in 15 shots |
| Keyboard-only three-shot run | Won using Arrow keys and Enter; result panel received focus |
| Play again | Reset to hole 1, 0 shots, 0 cups; retained best=3, completion date, and settings |
| Reload | Current run and saved best remained intact |

The course exposes the goal, wind, walls, moving bumper, dotted prediction, shot limit, cup count, and pause state. Pointer, touch-sized labelled controls, Arrow-key aim/power, Enter, R, and Escape all work. The independent boundary/recovery pass confirmed:

- A zero-length drag and an attempted shot while paused consume no shot.
- Power stops at the advertised control boundaries of 30 and 180.
- The fifth miss advances the hole; the fifteenth reaches the loss screen.
- Malformed local storage recovers to a fresh hole-one run without a page error.
- Clipboard denial exposes selectable result text; sound and progress persist after reload.
- Demo and ordinary storage remain isolated; reset/start-for-real affect only demo data.

Evidence: `evidence/verification-7/independent-live.json`, `live-win-end.png`, and `live-loss-end.png`.

## Privacy, security, and applicability

During the complete live landing → demo → win → restart → reload flow, the browser recorded only same-origin GET requests for the document and static assets. It recorded no third-party origins, POSTs, cookies, failed responses, console errors, or page errors.

Responses include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP with `object-src 'none'` and `frame-ancestors 'none'`. Evidence: `evidence/verification-7/independent-live.json` and the `*-headers.txt` files.

This is a static, local-first browser game. Source and runtime traffic contain no server API, unlock call, account, sign-in, payment, realtime connection, or service worker. Therefore API rate-limit/429, Entra authority, backend concurrency, server persistence, and PWA offline-update checks are not applicable. Browser state is confined to `pinpoint:daily-v1` and the separate `demo:daily-v1` namespace.

## Accessibility, responsive behavior, and performance

- `/`, `/demo`, `/privacy`, `/terms`, and the 404 returned **zero axe violations of any impact**.
- Each route has `lang=en`, a specific title, one h1, one main landmark, ordered headings, alt text, header/footer, and labelled controls.
- Keyboard traversal covered the skip link, navigation, demo actions, pause, canvas, all controls, score-history action, and footer links. Every interactive stop had a visible 3 px solid focus outline; there was no trap.
- Dialog focus, Escape cancellation, confirmation, focus return, route focus, and live announcements passed.
- At 390×844, no interactive target was below 44×44 CSS pixels. The first action and complete canvas fit the first viewport.
- At 200% text size there was no horizontal overflow and Shoot remained usable.
- Reduced-motion mode changed scroll behavior to `auto` and suppresses effective transition/animation duration.
- Under 4× CPU throttling at 390×844, 120 rendered frames took 1,999.9 ms: **60.003 fps**. The runtime marker reports fixed simulation at 60 Hz.
- Fresh mobile Lighthouse: Performance 95, Accessibility 100, Best Practices 100, SEO 100; LCP 1.309 s, CLS 0.
- `/opt/fleet/lib/verify-url.sh` passed `/demo` at HTTP 200 with no console/page errors and all baseline semantic checks.

Evidence: `evidence/verification-7/independent-live.json`, `lighthouse-mobile.json`, and `verify-url/verify.json`.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

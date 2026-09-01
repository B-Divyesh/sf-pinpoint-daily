# Pinpoint Daily repair handoff

## Result

Release blockers from verifier report `60613223d5c0c5e14f00e657de560aa53b34ae07` are repaired and deployed to `https://pinpoint-daily.sociobot.in`. The artifact remains a Vite + TypeScript static browser game. Production deployment ID: `fed115e4-7369-4d2d-97bb-fdde2d4d7343`.

## Reproduction before repair

- Selecting **Try it with sample data** changed the URL to `/demo` but left the home title, omitted the demo banner, wrote `pinpoint:daily-v1`, and left `demo:daily-v1` empty.
- Direct `/demo` at 390×844 placed the headline at y=1064 and canvas at y=1679 because the 1200×800 editorial image rendered 800 CSS pixels tall.
- The original claim registry had three unit-only entries. Its five-shot check did not take five shots.
- The verifier evidence also showed lost run state, a visual-only sound toggle, identical three-cup and fifteen-miss outcomes, and no live CSP.

## Repairs

- Demo mode is derived on every route transition. `/demo`, `/?demo=1`, and the landing action all use only `demo:daily-v1`; reset and exit discard only demo data.
- The fixed demo seed makes scripted verification repeatable. The real game still uses the UTC daily seed.
- The 390 px layout removes the editorial image and compacts the introduction. On live production at 390×844, the headline starts at y=191 and the playable canvas spans y=633–840.
- Complete simulation snapshots now persist: hole, shot count, total, cups, aim, power, ball, velocity, elapsed simulation time, and outcome. Best score and sound state also restore.
- Web Audio tones play after user gestures for enabling sound, shots, cups, misses, wins, and losses.
- A three-cup run ends with **Course complete — you won**. A fifteen-miss run ends with **Course over — try again**. Restart resets the run and keeps settings and best score.
- Pause blocks shots. A click without a drag is ignored. Keyboard, pointer, and labelled controls remain supported.
- Client route changes focus and announce the new h1. Route titles, canonical URLs, and social titles update. Unknown production paths return the designed `404.html` with HTTP 404.
- The 1200×630 social card is derived from the original generated course artwork.
- `staticwebapp.config.json` is now shipped in `dist/`. Production sends the CSP and one-year immutable caching for hashed assets.
- `.factory/claims.json` now contains 13 visitor-facing claims. Each has exactly one tagged browser regression that begins at `/demo`.

## Verification evidence

- `npm ci` — 60 packages installed, 0 audit findings.
- `npm run lint` / `npm run typecheck` — pass.
- `npm test` — 7/7 deterministic core and deployment-policy tests pass.
- `npm run build` — pass; `dist/` produced.
- `npm run test:browser` — 16/16 Chromium tests pass locally.
- `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` — 16/16 pass against production.
- Every exact claim command in `.factory/claims.json` was run separately and passed.
- `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo .factory/evidence/repair-live` — HTTP 200, title/lang/h1/main/alt/button checks pass, no console errors.
- Playwright axe checks `/`, `/demo`, `/privacy`, `/terms`, and the 404 page; no serious or critical findings. The same suite verifies keyboard operation, 44 px first-screen targets, 200% text, and reduced motion.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.8 s, LCP 1.2 s, CLS 0, TBT 10 ms.
- Live 390×844 test under 4× CPU throttling measured 60.003 rendered fps; simulation frequency is fixed at 60 Hz.
- Production bundles: JS 18,284 bytes raw / 7.35 KB gzip; CSS 6,638 bytes raw / 2.18 KB gzip; hero 81,670 bytes. All are below the product budgets.
- Live and `dist/` SHA-256 hashes match for HTML (`17b2d07…9567`), JS (`7c4e0d1…c5dc`), and CSS (`4054df8d…7148`).
- Live responses return CSP, HSTS, Referrer-Policy, and X-Content-Type-Options. Hashed JS returns `Cache-Control: public, max-age=31536000, immutable`.
- Live route responses: `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns 404.
- Privacy regression records the full demo interaction and finds only same-origin requests and no cookies.

Evidence is in `.factory/evidence/repair-local/` and `.factory/evidence/repair-live/`, including mobile/desktop captures, win/loss captures, headers, verifier output, and Lighthouse JSON.

## Scope notes

- Offline/update testing is not applicable: this release is not a PWA and makes no offline claim.
- Package/consumer, backend rate-limit, identity-provider, payment, and multiplayer checks are not applicable to this static, local-only game.
- No release-blocking gaps remain.

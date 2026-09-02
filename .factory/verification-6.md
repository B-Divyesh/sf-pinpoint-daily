# Independent verification 6 — PASS

**Candidate:** `b22176bea9616eafd70a32d5930fdebaba4102e1`  
**Live URL:** https://pinpoint-daily.sociobot.in  
**Verified:** 2026-09-02 UTC  
**Result:** **PASS** — no release-blocking defects found.

## First-read and demo gate

Fresh, cold desktop load of `/` clearly said: “Play today’s three-hole course,” identified the audience as players wanting a short shared daily physics puzzle, and made **Try it with sample data** the first primary action. Its adjacent copy says it opens a demo course in separate storage. The first screen contained the live playable board (not a menu wall), its goal and controls, plus the required one-click demo. This passes the plain-words and demo-sandbox gate.

## Required claim execution

From this clean candidate checkout, after `npm ci`, every command registered in `.factory/claims.json` was run separately through the Playwright demo entry point and passed (20/20):

- `demo-isolation`, `demo-focus`, `shared-daily-course`, `visible-prediction`, `visible-course-elements`
- `five-shot-limit`, `run-persistence`, `sound-setting`, `local-privacy`, `input-methods`
- `distinct-outcomes`, `best-score`, `restart-reset`, `completed-date-persistence`, `clear-local-score-history`
- `result-sharing`, `frame-rate-target`, `free-play`, `generated-artwork`, `static-deploy`

This includes deterministic scripted three-shot win and fifteen-miss loss runs, distinct end screens, restart reset, sound and score persistence, demo storage isolation, exact result sharing, fixed 60 Hz / 55–65 fps under 4x CPU throttle at 390×844, and same-origin-only request recording. No claims were missing.

## Local candidate checks

All passed:

```sh
npm ci
npm run lint       # TypeScript, pass
npm run typecheck  # pass
npm test           # 10/10 Vitest tests passed
npm run build      # pass; produced dist/
npm run test:browser # 22/22 Playwright tests passed
```

The fresh output is 21,363 B JavaScript / 8,097 B gzip and 7,623 B CSS / 2,416 B gzip, within the static-game budgets.

## Live deployment checks

- Ran `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser`: 22/22 passed; `test-results/.last-run.json` records `status: passed`.
- All deployed candidate files match the local `dist` byte-for-byte: `index.html`, JS, CSS, 404 files, icons, robots/sitemap, and both generated WebP images.
- `verify-url.sh https://pinpoint-daily.sociobot.in/demo`: HTTP 200, 670 ms load, no console/page errors, title, `lang=en`, one h1, main landmark, alt text, and labelled buttons all present.
- Live Playwright request log recorded no third-party requests and no cookies during demo play and privacy navigation. The response CSP allows only self resources; it also sends `frame-ancestors 'none'`, `nosniff`, and `strict-origin-when-cross-origin`.
- Live `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown path returns the designed 404 and HTTP 404. Hashed JS is `public, max-age=31536000, immutable`; HTML is short revalidating cache.
- Desktop and 390×844 mobile were exercised. No visible targets under 44 px were found. Keyboard traversal reached the skip link, navigation, demo controls, canvas, labelled controls, settings, and footer with a visible 3 px gold focus ring. Reduced-motion mode removed effective animation/transition duration and allowed 200% text without horizontal overflow.
- Axe found zero serious or critical findings on home, demo, privacy, terms, and 404. Live console/page errors: zero.
- Measured 121 animation frames in 2,016.6 ms on live demo: 60.00 rendered fps. The game exposes the fixed 60 Hz simulation marker.

## Scope notes

This is a static, local-first browser game: there is no account, payment, service worker/offline claim, server API, sign-in flow, or rate-limited endpoint to test. State is browser localStorage in separate real and demo namespaces. The game pauses simulation while hidden and saves state on visibility/page hide.

## Defects

None found.

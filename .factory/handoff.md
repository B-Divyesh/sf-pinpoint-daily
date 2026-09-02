# Pinpoint Daily repair handoff

## Result: PASS

Repair commit: `53c4e5d091bc114ea716393426fac1a8563f0793` (`fix: repair verifier coverage and mobile targets`). It is pushed to `main` and deployed to production at [pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in).

## What changed

- Repaired the `@claim:input-methods` evidence: its exact test now completes a non-zero pointer drag, asserts the shot count and rolling status, then separately proves keyboard and labelled controls.
- Repaired the `@claim:visible-course-elements` evidence: its exact test counts the cream wall rails as rendered Canvas pixels alongside the existing bumper-motion and wind checks. The claim sandbox descriptions now describe both proofs.
- Made every visible interactive target at least 44×44 CSS pixels, including footer Privacy/Terms and the return link on legal pages. A 390×844 regression test checks every public route, including the designed 404 page.
- Added a public footer disclosure for the generated original blueprint artwork on all routes and a regression test for it.
- Removed the one-year immutable rule for stable-name WebP files. Hashed `/assets/*` files retain immutable caching; live `hero-blueprint.webp` now uses `Cache-Control: public, must-revalidate, max-age=30`.

## Verification

Ran from a clean dependency install (`npm ci`: 60 packages, 0 vulnerabilities):

- `npm test` — 8/8 passed.
- `npm run lint` and `npm run typecheck` — passed.
- `npm run build` — passed; `dist/` produced. Output: JavaScript 20.27 kB raw / 7.84 kB gzip; CSS 7.14 kB raw / 2.29 kB gzip.
- `npm run test:browser` — 19/19 passed locally against the Static Web Apps emulator, including each registered claim, desktop/mobile, keyboard, reduced-motion, target-size, static route/response policy, Canvas gameplay, and Playwright Axe checks (zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, and 404).
- `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` — 19/19 passed against production.
- `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo .factory/evidence/repair-2-live` — passed: HTTP 200, title `Demo — Pinpoint Daily`, `lang=en`, one h1, main landmark, all images labelled, and no console/page errors. It loaded in 713 ms in the verifier.
- Live identity: the deployed `/assets/index-CUtenSYd.js` SHA-256 is `6994b8618719e8b58eab749a619409defd9145b5895d974d50cdddacb651aa44`, matching fresh `dist/` exactly. The deployed script contains the public generated-artwork disclosure.

Local and live verifier screenshots plus JSON reports are retained under `.factory/evidence/repair-2-local/` and `.factory/evidence/repair-2-live/`.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:browser
```

`dist/` is the static deployment output. Production was deployed to the product-owned `sf-pinpoint-daily` Static Web App using the work-order configuration.

## Known gaps

None in the product. Pinpoint Daily remains a local-only static game; it makes no offline or service-worker update claim.

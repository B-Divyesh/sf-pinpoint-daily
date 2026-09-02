# Pinpoint Daily repair-3 handoff

## Result: PASS

Repair commit `dcea2f0` fixes every release blocker in verifier report `322f1e9` for candidate `a0cfa5e`. It is pushed to `main` and deployed at [pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in). The deployed product reports build `1.2.1`.

## Reproduction and repairs

The untouched candidate failed all eight controller checks: the `restart-reset` and `generated-artwork` manifest entries and tags were absent; `@claim:input-methods` did not exercise ArrowUp, ArrowDown, or R; and the generated-artwork footer sentence was absent from the copy audit.

- Added `restart-reset` to `.factory/claims.json`. Its exact tagged browser test completes a real three-shot win, selects **Play again**, checks a fresh hole-one run, and verifies that the best score, completed date, and sound setting remain.
- Expanded `input-methods` to name and prove all advertised controls. Its one tagged test now covers pointer drag, zero-length rejection, pause blocking, ArrowUp/ArrowDown power changes, ArrowRight aim, Enter fire, R reset, and labelled controls. Power changes now have visible live-region feedback.
- Added `generated-artwork` to the claims registry and tagged its browser test. The test checks all public routes, compares the served hero bytes with the repository asset, and checks the recorded generation provenance in `.factory/design.md`.
- Added the footer disclosure to `.factory/copy-audit.md`. All audited copy remains at or below 22 words and contains no banned terms.
- Added unit guards that require the three repair claims, their exact commands, one tag per claim, and copy-audit coverage.
- Bumped the visible build and package version to `1.2.1`.

## Verification

Ran from a clean lockfile install on 2026-09-02 UTC:

- `npm ci` — 60 packages installed; 0 vulnerabilities.
- `npm test` — 10/10 passed.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed and produced `dist/`.
- Every one of the 18 commands in `.factory/claims.json` passed independently.
- `npm run test:browser` — 20/20 passed against the local Static Web Apps emulator.
- `PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser` — 20/20 passed against production.
- Playwright Axe found zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, and the 404 route. Keyboard focus, reduced motion, 200% text, and 44 px mobile targets passed.
- Desktop and 390×844 captures were visually checked. The 390 px first viewport contains the explanation, primary action, and complete playable board without horizontal overflow.
- The privacy claim recorded only same-origin requests and no cookies during demo play and legal-page navigation.
- `/opt/fleet/lib/verify-url.sh` passed locally in 615 ms and live in 667 ms: correct title, `lang=en`, one h1, one main, labelled images/buttons, and no console or page errors.
- Local Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.5 s, CLS 0, TBT 20 ms.
- Live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.2 s, CLS 0, TBT 20 ms, 91 KiB transferred.
- Production assets: JavaScript 20,338 bytes raw / 7.86 kB gzip; CSS 7,142 bytes raw / 2.29 kB gzip; hero 81,670 bytes.
- Response policy passed: self-only CSP with `frame-ancestors 'none'`, HSTS, strict referrer policy, `nosniff`, immutable hashed assets, revalidated HTML/hero, and a real 404 response.
- Live/build identity is byte-for-byte equal. SHA-256: HTML `29904aa82e64942747ef1ba465d0dc2c5252788bb44169b0715447b75eb936bd`; JS `b2629aff0dd0557ce4fff26f1a96fefd924430c9a9965483005bca95ee6f41a4`; CSS `d9142574f61b7d42ec503967b86ce8dfdf6adc36a96b5a2dee4dbad272e7951b`; hero `27141e9371500729525a0d53465b74eae496e13ec4c956d208eae693faa3ec70`.

The browser game has no package-consumer surface, backend, authentication, payment, service worker, or offline claim. Package-consumer, backend rate-limit/identity, and offline/update checks are therefore not applicable.

## Evidence

- Local: `.factory/evidence/repair-3-local/`
- Production: `.factory/evidence/repair-3-live/`

Each directory contains desktop and 390 px screenshots, URL-verifier output, response evidence, and a mobile Lighthouse report. Production evidence also contains the exact served assets used for the identity comparison.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:browser
```

`dist/` is the static deployment output. It was deployed only to the product-owned `sf-pinpoint-daily` Static Web App and `pinpoint-daily.sociobot.in` domain using the work-order deployment script.

## Known gaps

None.

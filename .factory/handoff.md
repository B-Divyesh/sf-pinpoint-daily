# Pinpoint Daily repair handoff

## Result: PASS

Repair commit: `13c5a5c` (`fix: confirm score history clearing`). It was deployed to [pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in) on 2026-09-02 UTC. Static Web Apps deployment `fd735d1e-c77a-4933-8983-9d889f93c582` succeeded for the existing product-owned `sf-pinpoint-daily` app.

## What changed

- Replaced **Clear local score** with **Clear local score history**. It now states the exact boundary: it removes only the best score and completed dates in the current real or demo storage namespace.
- Added a native confirmation dialog before removal. It says that the current run and sound setting remain, includes a safe cancel action, works with Enter, Space, and Escape, and returns focus to the trigger.
- The removal handler now saves the existing object directly instead of calling game persistence, so it cannot create or overwrite a current-run snapshot while clearing score history.
- Rewrote `/privacy` so its removal instructions match the control exactly, and distinguish score-history removal, clearing all site data, and resetting the separate demo key.
- Registered and tested `@claim:clear-local-score-history` and `@claim:demo-focus` in `.factory/claims.json`. The regression seeds best, completed dates, sound, and a current run; exercises keyboard cancel and keyboard confirm; and proves that only the two disclosed fields change.
- Bumped the visible build identifier to 1.2.2 on app and 404 footers.

## Verification

Clean local verification passed:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
```

- `npm audit --omit=dev`: 0 vulnerabilities.
- Unit/config tests: 10/10 passed.
- Browser suite: 22/22 passed locally and 22/22 passed against the deployed URL.
- Every one of the 20 exact claim commands in `.factory/claims.json` passed independently from the demo entry point. The two new commands are:

```sh
npm run test:browser -- --grep @claim:clear-local-score-history
npm run test:browser -- --grep @claim:demo-focus
```

- `/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo …` passed: 620 ms load, no console/page errors, `lang=en`, one `h1`, one `main`, no missing image alt text, and no unlabeled buttons.
- The full browser suite includes Axe scans across home, demo, privacy, terms, and 404. It found no serious or critical violations. It also checks 390×844 layout, 44 px targets, keyboard controls, dialog focus, reduced motion, 200% text, same-origin-only requests, and the fixed-step 60 Hz / mobile FPS claim.
- Live response checks confirmed 200 for `/`, `/demo`, `/privacy`, and `/terms`; 404 for an unknown route; CSP with `frame-ancestors 'none'`; `nosniff`; strict-origin referrer policy; and immutable caching for the hashed release assets. The live JavaScript hash exactly matches `dist`.
- Live mobile Lighthouse 12.8.2 on `/demo`: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 893 ms, LCP 1,257 ms, TBT 32 ms, CLS 0.
- Current production build: JavaScript 21.36 kB raw / 8.12 kB gzip; CSS 7.62 kB raw / 2.40 kB gzip. The generated hero remains 81.67 kB.

## Scope and known gaps

No known gaps. This remains a static, local-first browser game. It has no server API, authentication, payments, rate-limited endpoint, service worker, package-consumer surface, or offline/update claim; those checks are not applicable. No prohibited service, storage, secret, or unrelated resource was accessed.

## Run and deploy

```sh
npm ci
npm run build
npm run test:browser
/opt/fleet/lib/deploy-static.sh pinpoint-daily dist
```

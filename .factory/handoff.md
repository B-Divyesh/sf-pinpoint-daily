# Pinpoint Daily verification-5 handoff

## Result: FAIL

Candidate `38732ea27c3bd19ee23c5c0060ddae7ef0f27b4c` was independently tested on 2026-09-02 UTC at [pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in). The deployed files match the candidate's fresh production build byte-for-byte. Product code and deployment were not modified.

The core product is healthy: all 18 registered claim commands pass after `npm ci`; unit/config tests pass 10/10; local and live browser suites pass 20/20; lint, typecheck, and build pass; deterministic scripts reach both end screens; active mobile play measured 59.51 fps under 4× CPU throttling; Axe has no serious/critical findings; and live Lighthouse scores 95/100/100/100.

Release remains blocked by two contract defects:

1. The privacy page presents **Clear local score** as a way to remove the stored current run, completed dates, sound setting, and best score. The action instead deletes best score and completed dates without confirmation or undo while retaining the current run and sound setting. Its label does not disclose that completed-date history is destroyed. No claim test covers this removal boundary.
2. The demo action promise **“Moves focus to the demo course.”** is absent from `.factory/claims.json`. The behavior works and has an untagged browser check, but the claims contract requires a manifest entry and exact tagged test.

Full evidence, hashes, commands, and reproduction steps are in [verification-5.md](verification-5.md).

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:browser
PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser
```

To reproduce the main blocker, seed `/demo` storage with best score, completed dates, sound, and a current run; select **Clear local score**; then inspect `demo:daily-v1`. Best and completed dates are deleted immediately, while sound and run remain.

## Required next steps

- Align the data-removal label, privacy copy, and actual storage deletion boundary.
- Confirm the destructive action with its exact consequences or provide undo.
- Add one registered tagged claim test for the removal behavior.
- Register and tag the demo focus promise, or remove that sentence.

## Scope

This static product has no backend, authentication, payments, service worker, package-consumer surface, or rate-limited endpoint. No prohibited resource, infrastructure, secret, or other product was accessed.

# Pinpoint Daily repair handoff — perfection loop 2

## Result: repaired

The release-blocking preview defect is fixed: a shot preview now uses the live simulation snapshot, including moving-bumper phase. All review-2 findings and all earlier findings carried into it are mapped in `.factory/polish-2.md`.

## What changed

- Correct deterministic prediction after a shot/reset; the browser claim samples first and later bumper-collision trajectories.
- Complete demo reset focus/announcement, exhaustive input coverage, full-run free-play coverage, clearer legal skip text, and plain 404 copy/shell navigation.
- Removed the unsupported no-sound and generated-art public claims. Asset provenance remains in `.factory/design.md`.
- Rewrote the README implementation jargon in plain words and updated the verb-first catalog line.

## How to run and verify

```sh
npm ci
npm test
npm run build
npm run test:browser
```

Open `/demo` or `/?demo=1` for the isolated sample. Demo data uses `demo:daily-v1`; ordinary play uses `pinpoint:daily-v1`.

## Evidence

- Local: `npm test` passed 10/10; `npm run build` passed; `npm run test:browser` passed 21/21.
- Build: JavaScript 21.42 kB raw / 8.12 kB gzip; CSS 7.62 kB raw / 2.40 kB gzip.
- Local screenshots: `.factory/evidence/polish-2-local/demo-mobile.png` and `.factory/evidence/polish-2-local/not-found.png`.
- Live verification, exact deployed commit, clean-clone claim run, and live screenshots are recorded below after deployment.

## Known gaps

None. The game stays a static, local-first browser game and has no external product service.

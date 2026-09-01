# Pinpoint Daily handoff

## What shipped

- A complete daily three-hole tabletop golf run at `/`, with deterministic UTC date seeds, visible predicted path, five-shot holes, wind, moving bumpers, pause/restart, keyboard, touch, and persistent local best score.
- A one-click isolated demo at `/demo` and `?demo=1`, with a persistent demo banner, reset, and separate `demo:daily-v1` localStorage namespace.
- Blueprint drafting-sheet visual system, original generated course illustration, legal routes, metadata, accessibility structure, static routing/configuration, README, MIT license, copy audit, claims, and demo documentation.

## Verification

- `npm test` — 4 deterministic core and tagged claim tests pass.
- `npm run build` — passes and writes `dist/index.html`; production JS is 5.79 KB gzip and CSS is 1.99 KB gzip.
- `npm run test:browser` — 3 Playwright checks pass: demo/keyboard interaction, 390px mobile controls, same-origin request check, and axe serious/critical check.
- Manual desktop visual check at 1280×720 and generated hero image review completed. The WebP course art is 80 KB. Initial app assets are well under the 200 KB JS and 300 KB hero budgets.

## Quality notes

- The fixed 60 Hz loop pauses simulation while the document is hidden and clamps long frames.
- This static app makes no game network request and uses only browser localStorage. No analytics are included.
- Lighthouse was not run in this container. The build-size and browser accessibility checks above are the measured proxy; no known console errors occurred in Playwright.

## Known gaps / next steps

- The game intentionally has no leaderboard or account system; scores are device-local as the brief requires.
- A future release could add more seeded hole layouts after play data confirms difficulty pacing.

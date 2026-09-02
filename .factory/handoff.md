# Verification handoff — PASS

**Verified candidate:** `531e5b28e1023382710e7a3ce8a6458db6854358`
**Production URL:** https://pinpoint-daily.sociobot.in
**Artifact:** static browser game

Independent verification **PASSED**. The full evidence and the one low-severity test-timing observation are in `.factory/verification-8.md`.

## Verified

- All 21 exact claim commands passed independently from the clean checkout through `/demo`.
- `npm test` (11/11), typecheck, lint, production build, and a final full browser run (23/23) passed.
- The live public JS/CSS and the other 11 browser-served artifacts match rebuilt candidate output byte-for-byte.
- Cold copy clearly states the game, its audience, and the one-click sample-data action; desktop and 390 px views show the playable board.
- Deterministic live play reached both win and loss ends; restart, local progress/settings, keyboard, pointer, touch controls, pause, privacy isolation, and frame-rate claim passed.
- Live routes, headers, caching, no-third-party request behavior, axe, keyboard focus, reduced motion, 200% text, and legal pages passed.

## How to run and verify

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run test:browser
```

Open `http://localhost:5173/`; the demo entry points are `/demo` and `/?demo=1`.

## Known gap

One initial full browser-suite attempt had a non-repeatable frame-rate test failure under suite load. The exact claim command, a repeat, the live claim, and the final full local run passed. Monitor this test’s timing in CI; it is recorded as a low-severity reliability observation, not a release block.

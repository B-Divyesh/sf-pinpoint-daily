# Pinpoint Daily verification handoff

## Result: FAIL

Candidate `a0cfa5ed0b2af93137ad8cb6272b5b1d173287ef` was independently tested on 2026-09-02 UTC at [pinpoint-daily.sociobot.in](https://pinpoint-daily.sociobot.in). The deployed files match the fresh candidate build exactly, and the game works through both real end screens. Release acceptance fails because the mandatory claims inventory does not cover all required and advertised behavior.

## Release blockers

1. **Restart reset is missing from `.factory/claims.json`.** The visible **Play again** action works, but the game-loop contract requires a dedicated claim and tagged test proving that it resets a completed run while preserving the intended settings/progress.
2. **Advertised keyboard controls are not fully proved.** README promises Arrow-key power adjustment and `R` reset. The exact `@claim:input-methods` test does not exercise ArrowUp/ArrowDown or `R`.
3. **The generated-artwork disclosure is an unlisted claim.** It appears on every public route and has an untagged browser test, but no entry in `.factory/claims.json`.

Low: `.factory/copy-audit.md` omits the current generated-artwork footer sentence.

Full evidence and remediation details are in [verification-4.md](verification-4.md).

## What passed

- First-read gate: the cold desktop and 390 px screens state what the game is, who it is for, what to click, and show the game itself.
- All 16 existing claim commands pass after `npm ci`.
- `npm test` 8/8; lint and typecheck pass; `npm run build` produces `dist/`.
- Local Playwright 19/19 and live Playwright 19/19.
- Independent live scripted play: three-shot win, fifteen-shot loss, reload persistence, restart reset, keyboard, touch, pointer, pause, invalid-input recovery, and sound persistence all work.
- Independent Axe: zero violations on five routes at desktop and mobile widths.
- Mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1,202 ms; CLS 0; TBT 57 ms; 93,551 bytes transferred.
- Active-play frame-rate check at 390×844 under 4× CPU throttling: 60 Hz simulation marker and 60 rendered fps.
- Only same-origin requests, no cookies, no console/page errors, correct security/cache headers, and byte-for-byte live/build identity.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:browser
PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser
/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo .factory/evidence/verification-4-live
```

The product is static and local-only. It has no API, authentication, payment, service worker, or offline claim. No product code or deployment was modified during verification.

# Pinpoint Daily adversarial review 2 handoff

## Result: FAIL

Reviewed candidate `d38065687f36944e7e133b50a47179f072ce1c23` and the live site `https://pinpoint-daily.sociobot.in` on 2026-09-02 UTC. The cold first read and demo gate pass, but `.factory/review-2.md` records five blocking and nine minor findings.

The most important defect is functional: the dotted preview starts its moving-bumper simulation at elapsed time zero, while later real shots retain the live elapsed time. A deterministic review probe measured a 449.64-pixel preview/shot divergence after an earlier shot and reset. The registered test only counts cyan pixels. Other blockers are incomplete input/free-play tests, an unlisted no-sound fallback claim, and a circular generated-artwork provenance test.

## Verification performed

```sh
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser
/opt/fleet/lib/verify-url.sh https://pinpoint-daily.sociobot.in/demo <temporary-evidence-directory>
```

- All 20 exact `.factory/claims.json` commands passed independently from clean clone `/tmp/pinpoint-review2-z6aoJX/repo`; review-level assertion gaps remain documented.
- Unit/config tests passed 10/10. Live Playwright passed 22/22. Build produced 21.36 kB raw / 8.12 kB gzip JavaScript.
- Live verifier passed in 666 ms with no console/page errors.
- Fresh mobile and desktop contexts confirmed first-read clarity. Mobile demo showed the full sample canvas by y=840.
- Demo writes only `demo:daily-v1`; Reset and Start for real left seeded `pinpoint:daily-v1` unchanged. Reset loses keyboard focus.
- Request logs contained only the product origin and no cookies.
- Axe found no serious/critical issues on the four product routes and designed 404. Deep links and browser Back focused and announced the destination h1.
- All intended internal links returned 200; the unknown route returned the designed HTTP 404.

## Files changed

- `.factory/review-2.md` — complete adversarial review, copy counts, claims, prior-finding audit, structure, demo, and verdict.
- `.factory/handoff.md` — this reviewer handoff.

No product code, deployment configuration, infrastructure, DNS, secrets, or external resources were modified. Fixes are intentionally left to the product owner/repair round.

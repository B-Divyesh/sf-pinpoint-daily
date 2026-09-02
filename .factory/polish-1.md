# Perfection loop 1 — finding closure

- Date: 2026-09-02 UTC
- Implementation commit: `1ddafea`
- Live URL: `https://pinpoint-daily.sociobot.in`

Every finding in `.factory/review-1.md` is closed. The earlier verification findings are also rechecked below.

## Review 1 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Replaced “fair” with the measurable “one shared course each day.” | `@claim:shared-daily-course`; `.factory/evidence/polish-1-live/home-mobile-cold.png`; live `/` |
| F-1-2 | Removed the unregistered public-leaderboard statement. | `@claim:local-privacy`; `.factory/copy-audit.md`; live `/` |
| F-1-3 | Extended the isolated-demo test to open `/?demo=1` in its own browser context, write demo settings, and compare the untouched real key. | `@claim:demo-isolation`; `.factory/evidence/polish-1-live/demo-alias-mobile-cold.png`; live `/?demo=1` |
| F-1-4 | Removed the README coverage promise and added a registry-integrity unit test that enforces one tag per registered claim. | `claims registry > maps every registered claim to exactly one test tag`; `npm test` 8/8 |
| F-1-5 | Added a precise static-build claim instead of an untested architecture statement. | `@claim:static-deploy`; clean build produced `dist/` |
| F-1-6 | Served `dist/` through the Static Web Apps emulator and tested real route statuses plus CSP, referrer, and MIME headers. | `@claim:static-deploy`; `.factory/evidence/polish-1-live/root-headers.txt`; live `/demo`, `/privacy`, `/terms` |
| F-1-7 | Removed the public originality claim; provenance remains in `.factory/design.md`. | `.factory/evidence/polish-1-live/screenshot-desktop.png`; live footer |
| F-1-8 | Replaced “general audiences” with “Pinpoint Daily is free to play.” | `@claim:free-play`; live `/terms` |
| F-1-9 | Added completed-date storage and reload assertions after a deterministic win. | `@claim:completed-date-persistence`; live `/demo` |
| F-1-10 | Rebuilt the HTTP 404 with the product header, footer, skip link, legal links, metadata, icons, canonical, and blueprint art direction. | `@claim:static-deploy`; `.factory/evidence/polish-1-live/not-found.png`; live `/missing-polish-screenshot` returned 404 |
| F-1-11 | Replaced the repeated demo-entry CTA with “Play the sample course,” which scrolls to and focuses the course heading. | `390x844 first screen contains the explanation, action, and playable board`; `.factory/evidence/polish-1-live/demo-alias-mobile-cold.png` |
| F-1-12 | Removed the 24-word README sentence and reran the copy audit. | `.factory/copy-audit.md`; all sentences are 22 words or fewer |
| F-1-13 | Renamed “Less power” to “Decrease power.” | `@claim:input-methods`; live `/demo` |
| F-1-14 | Renamed “More power” to “Increase power.” | `@claim:input-methods`; live `/demo` |
| F-1-15 | Sound now names the action: “Turn sound on” and “Turn sound off,” while retaining `aria-pressed`. | `@claim:sound-setting`; live `/demo` |
| F-1-16 | Standardised the isolated mode as “demo” after the required “Try it with sample data” label. | `.factory/copy-audit.md`; `.factory/demo.md`; live `/` and `/demo` |
| F-1-17 | Added “Copy today’s result” to win and loss screens. It copies UTC date, cups, and shots only; clipboard failure reveals selected text. | `@claim:result-sharing`; `result sharing shows selectable text when clipboard access fails`; `.factory/evidence/polish-1-live/result-share.png` |

## Earlier verification findings rechecked

| Findings | Current evidence |
|---|---|
| B-01, B-02 | `@claim:demo-isolation` and the 390×844 first-screen test pass; cold live screenshots show the banner, action, board, and isolated namespace. |
| B-03 | `.factory/claims.json` has 16 entries; every exact command passed separately in a clean clone; registry integrity enforces one tag each. |
| H-01, H-02, H-03 | `@claim:run-persistence`, `@claim:sound-setting`, and `@claim:distinct-outcomes` pass locally and live. |
| H-04 | CSP is present on live 200 and 404 responses in `root-headers.txt` and `not-found-headers.txt`. |
| M-01 through M-04 | Accurate demo banner, 44 px targets, paused input blocking, and zero-length drag rejection pass in the live browser suite. |
| M-05 through M-07 | Immutable asset policy, HTTP 404, and route focus/announcement pass in config and live route tests. |
| L-01, L-02 | Route metadata updates are tested; `social-card.webp` is 1200×630. |

## Final evidence

- Clean clone: all 16 claim commands passed separately; `npm test` 8/8; `npm run test:browser` 17/17; lint, typecheck, and build passed.
- Local Static Web Apps emulator: verify-url passed with zero console errors. Lighthouse: Performance 98, Accessibility 100, Best Practices 100, SEO 100.
- Live: browser suite 17/17 and verify-url passed with zero console errors. Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, TBT 50 ms, CLS 0.
- Live links crawled: `/`, `/demo`, `/privacy`, and `/terms` returned 200. The unknown route returned 404.
- Live and local SHA-256 values match for `index.html`, `index-CV20OVeV.js`, and `index-BI4ABKPG.css`.

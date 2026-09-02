# Pinpoint Daily polish round 3 handoff

## Result

Review 3 is fully repaired and deployed. All four blocking and two minor findings are closed, all earlier review findings remain closed, and no known work-order gap remains.

- Implementation commit: `932c4c8`
- Production deployment: `c0c9df7f-8840-4756-ae98-e3fe28b75b72`
- Live product: `https://pinpoint-daily.sociobot.in`
- Artifact/deployment class: browser game / static Azure Static Web App

## What changed

- Proved that `/demo` and `/?demo=1` ignore contradictory ordinary run, best, completion, and sound data while preserving the real key.
- Expanded the privacy claim through complete win and loss runs with exact request allowlisting and checks for account/ad UI, analytics channels, cookies, and data-bearing requests.
- Expanded shared-course coverage across all three browser-rendered holes in two fixed-clock contexts, including reloads.
- Added full origin-storage removal coverage and permanent no-undo score-history coverage.
- Replaced the first-screen game-rule fact with “Internet needed to open” and added its fresh offline-context claim test.
- Removed immutable caching from stable icon URLs while retaining one-year immutable caching for hashed build assets.
- Strengthened titles, descriptions, canonical/social metadata, focus, legal links, 404, cold mobile layout, and both result-to-restart checks.
- Updated `.factory/claims.json` to 21 claims, the copy audit, demo notes, README, catalog description, and build version 1.2.4.

The blueprint drafting-sheet visual system and original generated hero art were preserved.

## How to run

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/`. Demo entry points are `/demo` and `/?demo=1`.

## How to verify

```sh
npm test
npm run lint
npm run build
npm run test:browser
PLAYWRIGHT_BASE_URL=https://pinpoint-daily.sociobot.in npm run test:browser
```

Clean-clone evidence at commit `932c4c8`:

- All 21 exact commands in `.factory/claims.json` passed independently after `npm ci`.
- Unit/config tests: 11/11.
- Full browser suite: 23/23 locally and 23/23 live.
- Lint, typecheck, and production build passed.
- Production JavaScript: 21.42 kB raw / 8.12 kB gzip; CSS: 7.62 kB raw / 2.40 kB gzip.
- Local Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.6 s, TBT 20 ms, CLS 0.
- Live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.2 s, TBT 10 ms, CLS 0.
- Live verify-url: 618 ms, no console/page errors, title, `lang=en`, one H1, main, alt text, and labelled buttons passed.
- Live 4× CPU measurement: 60.003 fps over 120 frames; fixed simulation marker is 60 Hz.
- Live routes: `/`, `/demo`, `/privacy`, `/terms` return 200; unknown route returns the designed 404.
- Deployed `index.html`, hashed JS/CSS, 404 HTML/CSS, icons, hero, social card, robots, and sitemap match local `dist/` byte-for-byte.
- Stable icons return `Cache-Control: public, must-revalidate, max-age=30`; hashed JavaScript remains one-year immutable.

Round evidence is in `.factory/evidence/polish-3-local/` and `.factory/evidence/polish-3-live/`. The per-finding map is `.factory/polish-3.md`.

## Known gaps and next steps

None within this work order. The connectivity limitation is now disclosed: a fresh first visit needs internet access. Offline play is not claimed and no service worker is shipped.

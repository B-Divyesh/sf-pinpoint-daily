# Pinpoint Daily verification handoff

## Result: FAIL

Independent QA checked commit `63dfbde58d26fd9c492aed46f55d35f170fe68ad` and `https://pinpoint-daily.sociobot.in/` on 2026-09-01 UTC. The live HTML, JavaScript, CSS, and hero image match the local production build.

Release blockers:

- Selecting **Try it with sample data** from `/` changes the URL to `/demo` but stays in real mode and writes `pinpoint:daily-v1`.
- At 390×844, the 800 px-tall hero image pushes the headline to y=1064 and the game canvas to y=1679, so the first screen does not explain or show the game.
- `.factory/claims.json` omits several page/README promises, and its five-shot test does not exercise the five-shot observable boundary or the demo UI.

Additional high-severity defects:

- Reload loses the current hole and shots despite persistence copy.
- Saved sound state is not restored, and the sound control produces no sound.
- A 15-miss run is labelled **Course complete**, so there is no distinct loss outcome.
- The live deployment omits the configured Content-Security-Policy header.

Full evidence, severity, exact commands, live scripted win/miss runs, accessibility, privacy, headers, caching, bundle sizes, and Lighthouse measurements are in `.factory/verification.md` and `.factory/evidence/`.

Verification commands:

```sh
npm ci
npm test
npm run build
npm run test:browser
```

Observed after installation: 4/4 unit tests pass, 3/3 repository browser tests pass, the production build succeeds, axe reports no serious/critical findings, and Lighthouse reports 100 in performance/accessibility/best-practices/SEO with LCP 1301 ms. The deterministic live run reaches the end screen both in 3 successful shots and after 15 misses; **Play again** resets the run.

No product source was changed. The next step is to correct the blockers and add claim tests that select the first-screen demo action, complete both outcome paths, reload in-progress state/settings, and measure the advertised frame-rate target.

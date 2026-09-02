# Perfection loop 2 — finding closure

- Candidate: repair after `d38065687f36944e7e133b50a47179f072ce1c23`
- Local evidence: `.factory/evidence/polish-2-local/demo-mobile.png`, `.factory/evidence/polish-2-local/not-found.png`
- Live evidence: `.factory/evidence/polish-2-live/demo-mobile.png`, `.factory/evidence/polish-2-live/not-found.png`

Every finding in both adversarial reviews and their carried verification reports is closed. The live checks below are repeated after deployment.

## Review 2 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-2-1 | The preview now starts from `sim.snapshot()`, preserving the live elapsed bumper phase. | `@claim:visible-prediction` compares sampled first and post-reset bumper-collision paths to live simulation; live `/demo` |
| F-2-2 | The input test now operates ArrowLeft, ArrowRight, every labelled aim/power control, Shoot, Reset, R, Enter, Escape, drag, and zero-length drag. | `@claim:input-methods`; live `/demo` |
| F-2-3 | The free-play test completes all three holes and checks each stage and the result screen. | `@claim:free-play`; live `/demo` |
| F-2-4 | Removed the unsupported no-sound promise; the failure status only reports the sound error. | copy audit; live `/demo` |
| F-2-5 | Removed the public generated-art claim and its circular registry test. Source provenance remains in `design.md`. | claims registry integrity test; live `/`, `/demo`, `/privacy`, `/terms` |
| F-2-6 | Reset demo restores focus to Reset demo and announces “Demo reset.” | `@claim:demo-isolation`; live `/demo` |
| F-2-7 | The shared skip link now says “Skip to main content.” | `@claim:static-deploy`; live `/privacy`, `/terms` |
| F-2-8 | The static 404 eyebrow now says “PAGE NOT FOUND · 404.” | `@claim:static-deploy`; live unknown URL |
| F-2-9 | Both 404 paths now use “This page does not exist.” | `@claim:static-deploy`; live unknown URL |
| F-2-10 | Static 404 navigation now includes How it works, matching the site shell. | `@claim:static-deploy`; live unknown URL |
| F-2-11 | README now calls the audience “players.” | copy audit; README |
| F-2-12 | README now says the UTC date chooses the course. | copy audit; README |
| F-2-13 | README now says physics updates 60 times each second. | `@claim:frame-rate-target`; README |
| F-2-14 | README now consistently says browser storage. | `@claim:demo-isolation`; README |

## Review 1 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the measurable “one shared course each day” wording. | `@claim:shared-daily-course`; live `/` |
| F-1-2 | Kept the unsupported leaderboard statement removed. | `@claim:local-privacy`; live `/` |
| F-1-3 | Kept `/?demo=1` in the isolated-demo regression. | `@claim:demo-isolation`; live `/?demo=1` |
| F-1-4 | Kept registry integrity enforcement and removed the coverage assurance. | `claims registry > maps every registered claim to exactly one test tag` |
| F-1-5 | Kept the static-build claim and test. | `@claim:static-deploy`; fresh `dist/` |
| F-1-6 | Kept route and header checks through the Static Web Apps emulator. | `@claim:static-deploy`; live `/demo`, `/privacy`, `/terms` |
| F-1-7 | Removed the public originality claim instead of relying on circular proof. | claims registry integrity test; live footer |
| F-1-8 | Kept terms limited to “free to play.” | `@claim:free-play`; live `/terms` |
| F-1-9 | Kept completed-date save and reload coverage. | `@claim:completed-date-persistence`; live `/demo` |
| F-1-10 | Kept the full metadata/site shell 404, then corrected its wording and navigation. | `@claim:static-deploy`; live unknown URL |
| F-1-11 | Kept demo-only “Play the sample course” focus action. | `@claim:demo-focus`; live `/demo` |
| F-1-12 | Re-ran the copy audit; README maximum is 19 words. | `.factory/copy-audit.md` |
| F-1-13 | Kept “Decrease power.” | `@claim:input-methods`; live `/demo` |
| F-1-14 | Kept “Increase power.” | `@claim:input-methods`; live `/demo` |
| F-1-15 | Kept action-named sound controls. | `@claim:sound-setting`; live `/demo` |
| F-1-16 | Kept demo terminology after the required sample-data entry action. | `.factory/copy-audit.md`; live `/demo` |
| F-1-17 | Kept non-spoiling result copying and its selected-text fallback. | `@claim:result-sharing`; live `/demo` |

## Earlier verification findings carried by review 2

| Finding | Change made | Evidence |
|---|---|---|
| B-01 | Demo remains in the `demo:` namespace. | `@claim:demo-isolation` |
| B-02 | Mobile shows the playable course in the initial viewport. | `390x844 first screen contains the explanation, action, and playable board`; mobile screenshot |
| B-03 | Claims registry now has no unlisted fallback or provenance promise. | claims registry integrity test; clean claim-command run |
| H-01 | Current-run reload remains covered. | `@claim:run-persistence` |
| H-02 | Sound setting and gesture behavior remain covered. | `@claim:sound-setting` |
| H-03 | Win and loss outcomes remain distinct. | `@claim:distinct-outcomes` |
| H-04 | CSP remains tested in emulator and live. | `@claim:static-deploy`; live headers |
| M-01 | Demo banner says sample data is saved only there. | `@claim:demo-isolation` |
| M-02 | Mobile target dimensions remain at least 44 px. | `390x844 exposes 44px targets through every public page` |
| M-03 | Pause blocks shots. | `@claim:input-methods` |
| M-04 | Zero-length pointer input is rejected. | `@claim:input-methods` |
| M-05 | Only hashed assets use immutable caching. | `static deployment policy > sets immutable caching` |
| M-06 | Unknown addresses return the designed HTTP 404. | `@claim:static-deploy`; live unknown URL |
| M-07 | Route changes restore h1 focus and announcement. | `@claim:static-deploy` |
| L-01 | Valid routes and 404 set route metadata. | `@claim:static-deploy` |
| L-02 | Social card remains 1200×630. | `@claim:static-deploy`; `public/social-card.webp` |

## Verification record

- `npm test`: 10 tests passed.
- `npm run build`: passed; production JavaScript is 21.42 kB raw / 8.12 kB gzip.
- `npm run test:browser`: 21 tests passed, including axe serious/critical checks, mobile layout, reduced motion, privacy, routes, and all registry claims.
- The catalog description is now verb-first and 57 characters: “Play a shared three-hole tabletop golf course each day.”

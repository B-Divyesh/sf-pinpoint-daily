# Pinpoint Daily

Play one shared three-hole tabletop golf course each day. It is for web-game players who want a fair 2–4 minute physics puzzle. Drag to aim and power a shot. The dotted path previews bounces before you shoot.

The course uses a UTC daily seed, fixed-step physics, five shots per hole, visible wind, and one moving bumper. Scores and settings stay in browser storage. There are no accounts, ads, analytics, or network game requests.

## Run it

```sh
npm install
npm run dev
```

Open `http://localhost:5173/`. The one-click sandbox is `/demo` or `/?demo=1`.

## Verify it

```sh
npm test
npm run build
npm run test:browser
```

The browser test covers the demo route, keyboard shooting, mobile layout, same-origin requests, and serious/critical axe findings. The claim tests are described in `.factory/claims.json`.

## Play controls

- Drag away from the ball, then release to shoot.
- Arrow keys set aim and power. Enter shoots.
- R resets the current hole. Escape pauses or resumes.
- Touch players can drag or use the labelled on-screen controls.

One run is intended to take 2–4 minutes. Progress, best score, and sound preference persist locally. The demo uses a separate localStorage key and does not touch ordinary game data.

## Deploy

This is a Vite static site. Deploy the contents of `dist/` with the included `staticwebapp.config.json` for SPA deep links and security headers.

## License

MIT. See [LICENSE](LICENSE).

# Pinpoint Daily

Play one shared three-hole tabletop golf course each day. It is for web-game players who want a short physics puzzle. Drag to aim and power a shot. The dotted path previews bounces before you shoot.

The course uses a UTC daily seed, fixed 60 Hz physics, five shots per hole, visible wind, and one moving bumper. Sink every cup to win; a missed hole produces a separate loss screen. The game targets 60 rendered frames per second on a mid-range phone.

The full game is free. Your current run, best score, and sound preference stay in browser storage. There are no accounts, ads, analytics, cookies, or third-party game requests.

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

The browser suite covers every entry in `.factory/claims.json`, deterministic win and loss runs, reloads, mobile layout, response safety, and serious or critical accessibility findings.

## Play controls

- Drag away from the ball, then release to shoot.
- Arrow keys set aim and power. Enter shoots.
- R resets the current hole. Escape pauses or resumes.
- Touch players can drag or use the labelled on-screen controls.

A run has three holes. Progress, best score, and sound preference persist locally. The demo uses a separate localStorage key and never reads or changes ordinary game data.

## Deploy

This is a Vite static site. Deploy the contents of `dist/` with the included `staticwebapp.config.json` for SPA deep links and security headers.

## License

MIT. See [LICENSE](LICENSE).

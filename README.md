# Pinpoint Daily

Play one shared three-hole tabletop golf course each day. It is for players who want a short browser physics puzzle. Drag to aim and power a shot. The dotted path previews bounces before you shoot.

The UTC date chooses the daily course. Physics updates 60 times each second. Each hole has five shots, visible wind, and one moving bumper. Sink every cup to win; a missed hole produces a separate loss screen. Copy the date, cups, and shots from either result screen. The game targets 60 rendered frames per second on a mid-range phone.

The full game is free. Your current run, completed dates, best score, and sound preference stay in browser storage. There are no accounts, ads, analytics, cookies, or third-party game requests.

## Run it

```sh
npm install
npm run dev
```

Open `http://localhost:5173/`. The one-click demo is `/demo` or `/?demo=1`.

## Verify it

```sh
npm test
npm run build
npm run test:browser
```

## Play controls

- Drag away from the ball, then release to shoot.
- Arrow keys set aim and power. Enter shoots.
- R resets the current hole. Escape pauses or resumes.
- Touch players can drag or use the labelled on-screen controls.

A run has three holes. Progress, completed dates, best score, and sound preference persist locally. The demo uses separate browser storage and never reads or changes ordinary game data.

## Deploy

`npm run build` creates `dist/` with static files, route rewrites, and security headers. Upload the contents of `dist/` to the static host.

## License

MIT. See [LICENSE](LICENSE).

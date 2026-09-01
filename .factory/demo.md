# Demo sandbox

Open `/demo` or `/?demo=1` for the try-out. It opens the complete three-hole course immediately, with a persistent banner that says sample data is in use.

The demo uses the `demo:daily-v1` localStorage key. It never reads or writes the real game key, `pinpoint:daily-v1`. **Reset demo** removes only the demo key. **Start for real** switches to the ordinary local key.

The sample is today’s deterministic three-hole course, including its visible wind and moving bumper. It is bundled in the app and does not need an account or network request.

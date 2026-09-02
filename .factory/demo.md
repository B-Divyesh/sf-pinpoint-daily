# Demo sandbox

Open `/demo` or `/?demo=1` for the demo. It opens a complete three-hole sample course immediately. A persistent banner says sample data is in use.

The demo uses the `demo:daily-v1` localStorage key. It never reads or writes the real game key, `pinpoint:daily-v1`. **Reset demo** removes only the demo key. **Start for real** discards the demo key before switching to the ordinary game.

The sample uses fixed seed `20260901`, including visible wind and moving bumpers. It is bundled in the app and does not need an account or network request.

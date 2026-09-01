# Pinpoint Daily design system

## Direction

**Blueprint drafting sheet.** The game is a tiny, fair course explained before it is played. A deep blueprint field makes the ball path, grid, cup, and measured bounce marks feel inspectable rather than mysterious. Warm drafting-paper panels are reserved for score and instructions, giving the course its one-screen focus.

## Palette

- `--ink` #062947 — blueprint ground and deepest text
- `--blue` #0b5f92 — construction lines and secondary controls
- `--cyan` #53d6e6 — predicted path and focus line
- `--paper` #f5edd7 — drafting-paper surface
- `--chalk` #fff9e9 — light text and ball
- `--coral` #ff715b — shot limit / warning
- `--gold` #f7c948 — cup flag and completed states

The page is intentionally dark-only. Chalk on ink and ink on paper both exceed 4.5:1 contrast.

## Type and spacing

The interface uses the self-hosted-system-compatible `ui-monospace` stack for measured labels and a weighty system sans stack for instructions. It avoids externally loaded fonts and keeps numbers aligned. Spacing follows an 8px scale: 8, 16, 24, 32, 48, 64. The game board has square corners with offset registration marks; supporting panels have a 2px drafting-line border.

## Interaction and motion

Dragging from the ball draws a cyan, dotted predicted path. Releasing takes the shot. The board uses a fixed 60 Hz simulation and only moves the ball during play. A subtle 180ms panel transition makes score changes legible. `prefers-reduced-motion` removes all transitions and decorative drift. There is no screen shake or flashing.

Keyboard play uses arrow keys to set aim and power, Enter to shoot, R to reset the current hole, and Escape to pause. Touch users drag or use the on-screen controls.

## Course generation and difficulty

The daily seed is the UTC date. It deterministically chooses three tabletop courses from seeded layouts. Each has one movable bumper and a light, deterministic wind field. Holes increase from a straight-line warmup, to one banking shot, to a tighter bumper and wind route. Each hole allows five shots; reaching the cup advances, while five misses record the hole and move on. A run is intended to take 2–4 minutes.

## Assets and provenance

`public/hero-blueprint.webp` is an original generated editorial illustration: a top-down blue drafting board with a tabletop golf course, no text, brands, or logos. It is generated via `/opt/fleet/lib/gen-image.sh` using the factory image deployment on 2026-09-01, then optimised to WebP for the landing preview. The live game board and its icons are procedural Canvas/SVG, authored for this product. Generated imagery is disclosed in the footer.

Prompt sheet: **Use case: stylized-concept. Asset: compact landing illustration. Subject: a top-down tabletop mini golf course drawn on deep navy blueprint paper, ruled cyan construction grid, chalk-white ball path, warm yellow flag, measured arcs and drafting marks. Materials: blue ink, vellum paper, precise technical illustration. Composition: wide with negative space. Avoid: text, watermark, logo, brands, people, photorealism.**

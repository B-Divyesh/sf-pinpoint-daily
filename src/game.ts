export type Vec = { x: number; y: number };
export type Wall = { x: number; y: number; w: number; h: number };
export type Hole = { start: Vec; cup: Vec; walls: Wall[]; bumper: { x: number; y: number; axis: 'x' | 'y'; range: number; phase: number }; wind: Vec; par: number };
export type SimulationSnapshot = { ball: Vec; velocity: Vec; elapsed: number; inCup: boolean };

export const BOARD = { w: 800, h: 480, ball: 11, cup: 17 };
export const MAX_SHOTS = 5;
export const FIXED_STEP = 1 / 60;

function random(seed: number) {
  let value = seed >>> 0;
  return () => ((value = (value * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function dailySeed(date = new Date()): number {
  const text = date.toISOString().slice(0, 10).replaceAll('-', '');
  return Number(text) || 20260901;
}

export function makeCourse(seed = dailySeed()): Hole[] {
  const r = random(seed);
  const side = r() > .5 ? 1 : -1;
  const breeze = (r() - .5) * .035;
  return [
    { start: { x: 112, y: 355 }, cup: { x: 676, y: 142 }, par: 2, wind: { x: 0, y: 0 }, walls: [{ x: 300, y: 140, w: 32, h: 190 }], bumper: { x: 468, y: 253, axis: 'y', range: 44, phase: r() * 6.2 } },
    { start: { x: 105, y: 126 }, cup: { x: 680, y: 344 }, par: 3, wind: { x: breeze, y: 0 }, walls: [{ x: 250, y: 88, w: 26, h: 205 }, { x: 520, y: 230, w: 28, h: 160 }], bumper: { x: 404, y: 362, axis: 'x', range: 74 * side, phase: r() * 6.2 } },
    { start: { x: 130, y: 350 }, cup: { x: 665, y: 130 }, par: 4, wind: { x: breeze * 1.4, y: -0.018 }, walls: [{ x: 230, y: 85, w: 28, h: 238 }, { x: 390, y: 244, w: 28, h: 174 }, { x: 555, y: 72, w: 27, h: 220 }], bumper: { x: 483, y: 160, axis: 'y', range: 65, phase: r() * 6.2 } }
  ];
}

export class GameSimulation {
  ball: Vec;
  previousBall: Vec;
  velocity: Vec = { x: 0, y: 0 };
  elapsed = 0;
  inCup = false;
  constructor(public hole: Hole, snapshot?: SimulationSnapshot) {
    this.ball = snapshot ? { ...snapshot.ball } : { ...hole.start };
    this.previousBall = { ...this.ball };
    if (snapshot) {
      this.velocity = { ...snapshot.velocity };
      this.elapsed = snapshot.elapsed;
      this.inCup = snapshot.inCup;
    }
  }
  get moving() { return Math.hypot(this.velocity.x, this.velocity.y) > .08; }
  bumperAt(time = this.elapsed): Vec {
    const shift = Math.sin(time * 1.3 + this.hole.bumper.phase) * this.hole.bumper.range;
    return this.hole.bumper.axis === 'x' ? { x: this.hole.bumper.x + shift, y: this.hole.bumper.y } : { x: this.hole.bumper.x, y: this.hole.bumper.y + shift };
  }
  shoot(aim: Vec) {
    if (this.moving || this.inCup) return false;
    const length = Math.hypot(aim.x, aim.y);
    if (length < 8) return false;
    const scale = Math.min(length, 180) * .115;
    this.velocity = { x: aim.x / length * scale, y: aim.y / length * scale };
    return true;
  }
  snapshot(): SimulationSnapshot {
    return { ball: { ...this.ball }, velocity: { ...this.velocity }, elapsed: this.elapsed, inCup: this.inCup };
  }
  reset() { this.ball = { ...this.hole.start }; this.previousBall = { ...this.ball }; this.velocity = { x: 0, y: 0 }; this.inCup = false; }
  step(dt = FIXED_STEP) {
    if (this.inCup) return;
    this.previousBall = { ...this.ball };
    if (!this.moving) return;
    this.elapsed += dt;
    this.velocity.x += this.hole.wind.x * dt * 60;
    this.velocity.y += this.hole.wind.y * dt * 60;
    this.ball.x += this.velocity.x * dt * 60;
    this.ball.y += this.velocity.y * dt * 60;
    this.velocity.x *= .985;
    this.velocity.y *= .985;
    const b = BOARD.ball;
    if (this.ball.x < b || this.ball.x > BOARD.w - b) { this.ball.x = Math.max(b, Math.min(BOARD.w - b, this.ball.x)); this.velocity.x *= -.78; }
    if (this.ball.y < b || this.ball.y > BOARD.h - b) { this.ball.y = Math.max(b, Math.min(BOARD.h - b, this.ball.y)); this.velocity.y *= -.78; }
    for (const wall of this.hole.walls) this.collideRect(wall);
    const bumper = this.bumperAt();
    const dx = this.ball.x - bumper.x, dy = this.ball.y - bumper.y, d = Math.hypot(dx, dy) || 1;
    if (d < 24) { const nx = dx / d, ny = dy / d; this.ball.x = bumper.x + nx * 24; this.ball.y = bumper.y + ny * 24; const dot = this.velocity.x * nx + this.velocity.y * ny; this.velocity.x -= 1.7 * dot * nx; this.velocity.y -= 1.7 * dot * ny; }
    const cupDistance = Math.hypot(this.ball.x - this.hole.cup.x, this.ball.y - this.hole.cup.y);
    if (cupDistance < BOARD.cup && Math.hypot(this.velocity.x, this.velocity.y) < 2.4) { this.ball = { ...this.hole.cup }; this.velocity = { x: 0, y: 0 }; this.inCup = true; }
    if (!this.moving) this.velocity = { x: 0, y: 0 };
  }
  private collideRect(rect: Wall) {
    const nearestX = Math.max(rect.x, Math.min(this.ball.x, rect.x + rect.w));
    const nearestY = Math.max(rect.y, Math.min(this.ball.y, rect.y + rect.h));
    const dx = this.ball.x - nearestX, dy = this.ball.y - nearestY;
    if (dx * dx + dy * dy > BOARD.ball * BOARD.ball) return;
    if (Math.abs(dx) > Math.abs(dy)) { this.ball.x = nearestX + Math.sign(dx || 1) * BOARD.ball; this.velocity.x *= -.78; }
    else { this.ball.y = nearestY + Math.sign(dy || 1) * BOARD.ball; this.velocity.y *= -.78; }
  }
}

export function predictedPoints(hole: Hole, from: Vec, aim: Vec) {
  const sim = new GameSimulation(hole); sim.ball = { ...from }; sim.elapsed = 0; if (!sim.shoot(aim)) return [] as Vec[];
  const points: Vec[] = [];
  for (let i = 0; i < 150 && sim.moving && !sim.inCup; i++) { sim.step(); if (i % 3 === 0) points.push({ ...sim.ball }); }
  return points;
}

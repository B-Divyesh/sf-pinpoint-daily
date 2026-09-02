import { describe, expect, it } from 'vitest';
import { FIXED_STEP, GameSimulation, SimulationSnapshot, Vec, dailySeed, makeCourse, predictedPoints } from '../src/game';

function actualPoints(holeIndex: number, snapshot: SimulationSnapshot, aim: Vec): Vec[] {
  const sim = new GameSimulation(makeCourse(20260901)[holeIndex], snapshot);
  sim.shoot(aim);
  const points: Vec[] = [];
  for (let frame = 0; frame < 150 && sim.moving && !sim.inCup; frame++) {
    sim.step();
    if (frame % 3 === 0) points.push({ ...sim.ball });
  }
  return points;
}

describe('deterministic game core', () => {
  it('creates the same three holes for a given UTC date', () => {
    const day = new Date('2026-09-01T12:00:00Z');
    expect(dailySeed(day)).toBe(20260901);
    expect(makeCourse(dailySeed(day))).toEqual(makeCourse(dailySeed(day)));
    expect(makeCourse(dailySeed(day))).toHaveLength(3);
  });

  it('returns a visible predicted path before a shot', () => {
    const hole = makeCourse(20260901)[0];
    const points = predictedPoints(hole, new GameSimulation(hole).snapshot(), { x: 120, y: -65 });
    expect(points.length).toBeGreaterThan(8);
    expect(points[0]).not.toEqual(hole.start);
  });

  it('predicts the exact first and later shot path from the live bumper phase', () => {
    const hole = makeCourse(20260901)[0];
    const first = new GameSimulation(hole);
    const firstAim = { x: 120, y: -65 };
    expect(predictedPoints(hole, first.snapshot(), firstAim)).toEqual(actualPoints(0, first.snapshot(), firstAim));

    // Let the bumper advance, then reset only the ball. The next preview must
    // retain the elapsed bumper phase rather than starting at phase zero.
    first.shoot({ x: 165, y: -30 });
    for (let frame = 0; frame < 300 && first.moving; frame++) first.step();
    first.reset();
    const later = first.snapshot();
    const candidates = [
      { x: 82, y: -160 }, { x: 96, y: -150 }, { x: 110, y: -145 },
      { x: 125, y: -135 }, { x: 140, y: -120 }, { x: 155, y: -105 },
    ];
    const bumperAim = candidates.find(aim => {
      const trial = new GameSimulation(hole, later);
      trial.shoot(aim);
      for (let frame = 0; frame < 150 && trial.moving; frame++) {
        trial.step();
        const bumper = trial.bumperAt();
        if (Math.hypot(trial.ball.x - bumper.x, trial.ball.y - bumper.y) <= 24.01) return true;
      }
      return false;
    });
    expect(bumperAim).toBeDefined();
    expect(predictedPoints(hole, later, bumperAim!)).toEqual(actualPoints(0, later, bumperAim!));
  });

  it('rejects zero-length shots and shots while the ball is moving', () => {
    const game = new GameSimulation(makeCourse(20260901)[0]);
    expect(game.shoot({ x: 0, y: 0 })).toBe(false);
    expect(game.shoot({ x: 100, y: -20 })).toBe(true);
    expect(game.shoot({ x: 100, y: -20 })).toBe(false);
  });

  it('uses a fixed deterministic simulation step', () => {
    expect(FIXED_STEP).toBe(1 / 60);
    const first = new GameSimulation(makeCourse(20260901)[1]);
    const second = new GameSimulation(makeCourse(20260901)[1]);
    first.shoot({ x: 125, y: 30 });
    second.shoot({ x: 125, y: 30 });
    for (let frame = 0; frame < 90; frame++) { first.step(); second.step(); }
    expect(first.snapshot()).toEqual(second.snapshot());
  });

  it('restores a moving simulation exactly from a snapshot', () => {
    const hole = makeCourse(20260901)[2];
    const original = new GameSimulation(hole);
    original.shoot({ x: 98, y: 40 });
    for (let frame = 0; frame < 45; frame++) original.step();
    const restored = new GameSimulation(hole, original.snapshot());
    for (let frame = 0; frame < 120; frame++) { original.step(); restored.step(); }
    expect(restored.snapshot()).toEqual(original.snapshot());
  });
});

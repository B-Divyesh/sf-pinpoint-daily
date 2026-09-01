import { describe, expect, it } from 'vitest';
import { FIXED_STEP, GameSimulation, dailySeed, makeCourse, predictedPoints } from '../src/game';

describe('deterministic game core', () => {
  it('creates the same three holes for a given UTC date', () => {
    const day = new Date('2026-09-01T12:00:00Z');
    expect(dailySeed(day)).toBe(20260901);
    expect(makeCourse(dailySeed(day))).toEqual(makeCourse(dailySeed(day)));
    expect(makeCourse(dailySeed(day))).toHaveLength(3);
  });

  it('returns a visible predicted path before a shot', () => {
    const hole = makeCourse(20260901)[0];
    const points = predictedPoints(hole, hole.start, { x: 120, y: -65 });
    expect(points.length).toBeGreaterThan(8);
    expect(points[0]).not.toEqual(hole.start);
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

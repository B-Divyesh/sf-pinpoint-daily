import { describe, expect, it } from 'vitest';
import { GameSimulation, MAX_SHOTS, dailySeed, makeCourse, predictedPoints } from '../src/game';

describe('daily course', () => {
  it('@claim:shared-daily-course creates the same three holes for a given UTC date', () => {
    const day = new Date('2026-09-01T12:00:00Z');
    expect(dailySeed(day)).toBe(20260901);
    expect(makeCourse(dailySeed(day))).toEqual(makeCourse(dailySeed(day)));
    expect(makeCourse(dailySeed(day))).toHaveLength(3);
  });

  it('@claim:visible-prediction returns a visible arc before a shot is taken', () => {
    const hole = makeCourse(20260901)[0];
    const points = predictedPoints(hole, hole.start, { x: 120, y: -65 });
    expect(points.length).toBeGreaterThan(8);
    expect(points[0]).not.toEqual(hole.start);
  });

  it('@claim:five-shots allows a game controller to cap a hole at five shots', () => {
    expect(MAX_SHOTS).toBe(5);
    const game = new GameSimulation(makeCourse(20260901)[0]);
    expect(game.shoot({ x: 100, y: -20 })).toBe(true);
    expect(game.shoot({ x: 100, y: -20 })).toBe(false);
  });

  it('uses fixed deterministic simulation steps', () => {
    const first = new GameSimulation(makeCourse(20260901)[1]);
    const second = new GameSimulation(makeCourse(20260901)[1]);
    first.shoot({ x: 125, y: 30 }); second.shoot({ x: 125, y: 30 });
    for (let i = 0; i < 90; i++) { first.step(); second.step(); }
    expect(first.ball).toEqual(second.ball);
    expect(first.velocity).toEqual(second.velocity);
  });
});

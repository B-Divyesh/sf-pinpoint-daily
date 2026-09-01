import { GameSimulation, makeCourse } from '../../src/game';

const holes = makeCourse(20260901);
for (let hole = 0; hole < holes.length; hole++) {
  let answer: { angle: number; power: number } | null = null;
  for (let power = 30; power <= 180 && !answer; power += 2) {
    for (let angle = -Math.PI; angle < Math.PI; angle += 0.01) {
      const simulation = new GameSimulation(holes[hole]);
      simulation.shoot({ x: Math.cos(angle) * power, y: Math.sin(angle) * power });
      for (let frame = 0; frame < 1200 && simulation.moving && !simulation.inCup; frame++) simulation.step();
      if (simulation.inCup) {
        answer = { angle, power };
        break;
      }
    }
  }
  console.log(JSON.stringify({ hole: hole + 1, answer }));
}

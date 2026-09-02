import { GameSimulation, makeCourse } from '../../../src/game';

const powers = [30, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 180];
const holes = makeCourse(20260901);

const pressCounts = Array.from({ length: 161 }, (_, index) => index === 0 ? 0 : Math.ceil(index / 2) * (index % 2 ? 1 : -1));
for (let holeIndex = 0; holeIndex < holes.length; holeIndex++) {
  let solution: { angle: number; presses: number; power: number } | undefined;
  for (const presses of pressCounts) {
    if (solution) break;
    const angle = -0.4 + presses * 0.12;
    for (const power of powers) {
      const simulation = new GameSimulation(holes[holeIndex]);
      simulation.shoot({ x: Math.cos(angle) * power, y: Math.sin(angle) * power });
      for (let frame = 0; frame < 1200 && simulation.moving && !simulation.inCup; frame++) simulation.step();
      if (simulation.inCup) {
        solution = { angle, presses, power };
        break;
      }
    }
  }
  console.log(JSON.stringify({ hole: holeIndex + 1, solution }));
}

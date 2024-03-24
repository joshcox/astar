import { GridRobot, Point } from "./grid-robot";

const result = new GridRobot().go(new Point(0, 0), new Point(3, 3));

console.log(result);

process.exit();

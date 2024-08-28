import { AStar } from "../src/astar";
import { Node } from "../src/node";
import { Score } from "../src/score";
import { IData, IGoal, IScore, IScoreOptions } from "../src/types";

/**
 * Represents a point in a 2D grid.
 * @implements {IData}
 */
export class Point implements IData {
  public id: string;
  constructor(public x: number, public y: number) {
    this.id = `${x},${y}`;
  }
  public equals = (other: Point): boolean => this.id === other.id;
  public distance = (other: Point): number => Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  protected shift = (x: number, y: number): Point => new Point(this.x + x, this.y + y);
  private static adjacentShifts = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  static adjacent = (point: Point): Point[] => Point.adjacentShifts.map(([dx, dy]) => point.shift(dx, dy))
}

/**
 * Represents a goal point in the grid.
 * @extends Point
 * @implements {IGoal}
 */
export class Goal extends Point implements IGoal {
  satisfiedBy = (node: Node<Point>): boolean => this.equals(node.data);
}

/**
 * Implements the Manhattan distance scoring for A* algorithm.
 * @implements {IScore}
 */
@Score
class ManhattanScore implements IScore {
  constructor(private data: Point, private goal: Goal, public options: IScoreOptions) { }
  public cost = () => 1;
  public heuristic = () => this.goal.distance(this.data);
}

/**
 * Creates and returns an instance of AStar for grid robot navigation.
 * @returns {AStar<Point, Goal>} An instance of AStar with Manhattan scoring.
 */
export default () => new AStar<Point, Goal>({
  Score: ManhattanScore,
  scoreOptions: <IScoreOptions>{},
  successors: node => Point.adjacent(node.data),
});

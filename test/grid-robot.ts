import { AStar, Node, Score, IData, IGoal, IScoreOptions } from "../src";

export class Point implements IData {
  public id: string;

  constructor(public x: number, public y: number) {
    this.id = `${this.x},${this.y}`
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  static adjacent(point: Point): Point[] {
    return [
      new Point(point.x + 1, point.y),
      new Point(point.x - 1, point.y),
      new Point(point.x, point.y + 1),
      new Point(point.x, point.y - 1)
    ];
  };
}

export class Goal extends Point implements IGoal {
  satisfiedBy(node: Node<Point>): boolean {
    return this.equals(node.data);
  }
}

class ManhattanScore extends Score {
  declare goal: Goal;
  declare data: Point;

  public baseCost = () => 1;
  public baseHeuristic = () => Math.abs(this.goal.x - this.data.x) + Math.abs(this.goal.y - this.data.y);
}

export class GridRobot {
  go(start: Point, goal: Goal): Point[] | null {
    return new AStar<Point>({
      score: {
        constructor: ManhattanScore,
        options: <IScoreOptions>{},
      },
      successorDataFactory: node => Point.adjacent(node.data),
    }).search(start, goal);
  }
}

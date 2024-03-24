import { AStar, Node, Score, IData, IGoal, IScoreOptions } from "../src";

export class Point implements IGoal, IData {
  constructor(public x: number, public y: number) {
    this.id = `${this.x},${this.y}`
  }
  public id: string;

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  satisfiedBy(node: Node<Point>): boolean {
    return this.equals(node.data);
  }

  getAdjacentMoves(): Point[] {
    return [
      new Point(this.x + 1, this.y),
      new Point(this.x - 1, this.y),
      new Point(this.x, this.y + 1),
      new Point(this.x, this.y - 1)
    ];
  }
}

class ManhattanScore extends Score {
  declare goal: Point;
  declare data: Point;

  public baseCost = () => 1;
  public baseHeuristic = () => Math.abs(this.goal.x - this.data.x) + Math.abs(this.goal.y - this.data.y);
}

export class GridRobot {
  go(start: Point, goal: Point): Point[] | null {
    return new AStar<Point>({
      score: {
        constructor: ManhattanScore,
        options: <IScoreOptions>{},
      },
      successorDataFactory: node => node.data.getAdjacentMoves(),
    }).search(start, goal);
  }
}

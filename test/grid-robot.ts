import { AStar } from "astar";
import { Node } from "node";
import { NodeFactory } from "node.factory";
import { Score } from "score";
import { ScoreFactory } from "score.factory";
import { IData, IGoal, IScoreOptions } from "types";

class Point implements IGoal, IData {
  constructor(public x: number, public y: number) {
    this.id = `${this.x},${this.y}`
  }
  public id: string;

  satisfiedBy(node: Node<Point>): boolean {
    return this.x === node.data.x && this.y === node.data.y;
  }
}

class ManhattanScore extends Score {
  declare goal: Point;
  declare data: Point;

  public baseCost = () => 1;
  public baseHeuristic = () => Math.abs(this.goal.x - this.data.x) + Math.abs(this.goal.y - this.data.y);
}

export class GridRobot {
  go(goal: Point, start: Point): Point[] | null {
    const factory = new NodeFactory<Point>(
      new ScoreFactory(ManhattanScore, <IScoreOptions>{}),
      node => {
        const { x, y } = node.data;
        return [
          new Point(x + 1, y),
          new Point(x - 1, y),
          new Point(x, y + 1),
          new Point(x, y - 1),
        ];
      }
    )
    const root = factory.createRoot();
    return new AStar(factory).search(factory.createChild(root, goal, start), goal);
  }

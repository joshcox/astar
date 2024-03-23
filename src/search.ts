import { AStar } from "astar";
import { NodeFactory } from "node";
import { ScoreFactory, ScoreOptions } from "score";
import { IData, IGoal, INode, IScoreConstructor } from "types";


export class Search {
  constructor(
    private Score: IScoreConstructor,
    private scoreOptions: ScoreOptions,
    private successors: (factory: NodeFactory) => (node: INode) => INode[]
  ) { }

  public select<Data extends IData>(goal: IGoal): Data[] | null {
    const scoreFactory = new ScoreFactory(this.Score, goal, this.scoreOptions);
    const nodeFactory = new NodeFactory(scoreFactory);
    const successors = this.successors(nodeFactory);
    return new AStar(successors).search<Data>(nodeFactory.createRoot(), goal);
  }
}

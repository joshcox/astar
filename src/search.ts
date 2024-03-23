import { AStar } from "astar";
import { ScoreOptions } from "score";
import { IData, IGoal, INode, IScore, NodeFactory, NodeWithFactory, ScoreWithFactory } from "types";


export class Search<Data extends IData, Node extends INode<Data>, Goal extends IGoal, Score extends IScore> {
  constructor(
    private Node: NodeWithFactory<Node, Score>,
    private Score: ScoreWithFactory<Score>,
    private scoreOptions: ScoreOptions,
    private successors: (factory: NodeFactory<Node>) => (node: Node) => Node[]
  ) { }

  public select(goal: Goal): Data[] | null {
    const root = this.Node.buildRoot();
    const scoreFactory = this.Score.factory(goal, this.scoreOptions)
    const nodeFactory = this.Node.factory(scoreFactory);
    const successors = this.successors(nodeFactory);
    return new AStar<Data, Node>(successors).search(root, goal);
  }
}

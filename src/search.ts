import { AStar } from "astar";
import { ScoreOptions } from "score";
import { IData, IGoal, INode, IScore, NodeFactory, ScoreFactory } from "types";

type NodeWithFactory<Node extends INode<IData>, Score extends IScore> = (new (p: Node, d: IData, s: Score) => Node) & {
  factory: (scoreFactory: ScoreFactory<Score>) => NodeFactory<Node>;
  buildRoot: () => Node;
};

type ScoreWithFactory<Score extends IScore> = (new (node: IData, goal: IGoal, options: ScoreOptions) => Score) & {
  factory: (goal: IGoal, options: ScoreOptions) => ScoreFactory<Score>;
};

export abstract class Search<Data extends IData, Node extends INode<Data>, Goal extends IGoal, Score extends IScore> {
  constructor(
    private scoreOptions: ScoreOptions
  ) { }

  abstract Score: ScoreWithFactory<Score>;
  abstract Node: NodeWithFactory<Node, Score>

  abstract successors: (factory: NodeFactory<Node>) => (node: Node) => Node[];

  public select(goal: Goal): Data[] | null {
    const root = this.Node.buildRoot();
    const scoreFactory = this.Score.factory(goal, this.scoreOptions)
    const nodeFactory = this.Node.factory(scoreFactory);
    const successors = this.successors(nodeFactory);
    return new AStar<Data, Node>(successors).search(root, goal);
  }
}

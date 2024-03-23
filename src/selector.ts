import { IData, IGoal, INode } from "types";
import { AStar, Node, NodeFactory, Score, ScoreOptions } from "./index";

class Goal implements IGoal {
  satisfiedBy(node: INode<IData>): boolean {
    return !!node;
  }
  size: number;
}

class SelectorScore extends Score {
  public baseCost = () => 1;
  public baseHeuristic = () => ((<{ size: number }><unknown>this.goal).size ?? 0) - this.data.id.length;

  @Score.Cost.Discount()
  @Score.Binary()
  public computerVision(): boolean {
    return true;
  }

  @Score.Heuristic.Penalty()
  @Score.Binary()
  public anyUnilaterals(): boolean {
    return false;
  }
}

class NodeData implements IData {
  id: string;
}

export class Selector {
  constructor(
    private candidateSet: { slug: string }[],
    private scoreOptions: ScoreOptions
  ) { }

  private successors = (factory: NodeFactory<NodeData, Node<NodeData>>) =>
    (node: Node<NodeData>): Node<NodeData>[] =>
      this.candidateSet.map(e => node.succeed(factory(node, { id: e.slug })))

  public select(goal: Goal): NodeData[] | null {
    const root = Node.buildRoot();
    const scoreFactory = SelectorScore.factory(goal, this.scoreOptions)
    const nodeFactory = Node.factory(scoreFactory);
    const successors = this.successors(nodeFactory);
    return new AStar(successors).search(root, goal);
  }
}

const result = new Selector([], {
  discounts: { computerVision: 0.5 },
  penalties: { anyUnilaterals: 0.5 },
}).select(new Goal());
console.log(result);

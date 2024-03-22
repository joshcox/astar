import { IData, IGoal, INode, INodeSuccessors } from "types";
import { AStar, Node, Score } from "./index";

class Goal implements IGoal {
  satisfiedBy(node: INode<IData>): boolean {
    return !!node;
  }
  size: number = 0;
}

class SelectorScore extends Score {
  @Score.Cost.Discount('computerVision')
  @Score.Binary()
  public computerVision(): boolean {
    return true;
  }

  @Score.Heuristic.Penalty('anyUnilaterals')
  @Score.Binary()
  public anyUnilaterals(): boolean {
    return false;
  }
}

class NodeData implements IData {
  id: string;
}

class NodeSuccessors implements INodeSuccessors<NodeData> {
  private node: INode<NodeData>;
  private candidateSet: { slug: string }[] = [];
  [Symbol.iterator](): Iterable<INode<NodeData>> {
    return this.candidateSet.map(e => this.node.succeed({ id: e.slug }));
  }
}

export class Selector {
  private scoreFactory = SelectorScore.factory({
    defaultCost: 1,
    discounts: { computerVision: 0.5 },
    penalties: { anyUnilaterals: 0.5 },
  });

  public select(goal: Goal): NodeData[] | null {
    return new AStar(
      new Node(null, new NodeData(), this.scoreFactory(goal)),
      new NodeSuccessors()
    ).search(goal);
  }
}

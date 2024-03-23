import { Search } from "search";
import { Node, NodeFactory, Score, ScoreOptions, IData, IGoal, INode } from "./index";

class Data implements IData {
  id: string;
}

class Goal implements IGoal {
  satisfiedBy(node: Node<Data>): boolean {
    return !!node;
  }
  size: number;
}

class SelectorScore extends Score {
  public baseCost = () => 1;
  public baseHeuristic = () => ((<{ size: number }><unknown>this.goal).size ?? 0) - this.data.id.length;

  @Score.Sub.Cost.Discount
  @Score.Sub.Util.Binary
  public computerVision(): boolean {
    return true;
  }

  @Score.Sub.Heuristic.Penalty
  @Score.Sub.Util.Binary
  public anyUnilaterals(): boolean {
    return false;
  }
}

const successors = (candidateSet: { slug: string }[]) =>
  (factory: NodeFactory) =>
    (node: INode): INode[] =>
      candidateSet.map(e => node.addChild(factory.createChild(node, { id: e.slug })))

export class Selector {
  constructor(
    private candidateSet: { slug: string }[],
    private scoreOptions: ScoreOptions
  ) { }

  public select(goal: Goal): Data[] | null {
    return new Search(
      SelectorScore,
      this.scoreOptions,
      successors(this.candidateSet)
    ).select(goal);
  }
}

const result2 = new Selector([], {
  discounts: { computerVision: 0.5 },
  penalties: { anyUnilaterals: 0.5 },
}).select(new Goal());
console.log(result2);

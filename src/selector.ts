import { Search } from "search";
import { Node, NodeFactory, Score, ScoreOptions, IData, IGoal } from "./index";

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

class Data implements IData {
  id: string;
}

const successors = (candidateSet: { slug: string }[]) =>
  (factory: NodeFactory<Node<Data>>) =>
    (node: Node<Data>): Node<Data>[] =>
      candidateSet.map(e => node.succeed(factory(node, { id: e.slug })))

export class Selector2 {
  constructor(
    private candidateSet: { slug: string }[],
    private scoreOptions: ScoreOptions
  ) { }

  public select(goal: Goal): Data[] | null {
    return new Search(
      Node,
      SelectorScore,
      this.scoreOptions,
      successors(this.candidateSet)
    ).select(goal);
  }
}

const result2 = new Selector2([], {
  discounts: { computerVision: 0.5 },
  penalties: { anyUnilaterals: 0.5 },
}).select(new Goal());
console.log(result2);

import { Node, NodeFactory, Score, ScoreOptions, IData, IGoal, INode, AStar, ScoreFactory } from "./index";

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

export class Selector {
  constructor(
    private candidateSet: { slug: string }[],
    private scoreOptions: ScoreOptions
  ) { }

  private successors = (_node: INode) => this.candidateSet.map(e => ({ id: e.slug }));

  public select(goal: Goal): Data[] | null {
    return new AStar(
      new NodeFactory(
        new ScoreFactory(SelectorScore, this.scoreOptions),
        this.successors
      )
    ).searchFromRoot(goal);
  }
}

const result2 = new Selector([], {
  discounts: { computerVision: 0.5 },
  penalties: { anyUnilaterals: 0.5 },
}).select(new Goal());
console.log(result2);

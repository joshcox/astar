import { Node, NodeFactory, Score, IData, IGoal, AStar, ScoreFactory, IScoreOptions, SubScore } from "./index";

class Data implements IData {
  id: string;
  exercise: { slug: string };
}

class Goal implements IGoal {
  satisfiedBy(node: Node<Data>): boolean {
    return !!node;
  }
  size: number;
}

class SelectorScore extends Score {
  declare goal: Goal;
  declare data: Data;

  public baseCost = () => 1;
  public baseHeuristic = () => (this.goal.size ?? 0) - this.data.id.length;

  @SubScore.G.Discount
  @SubScore.Binary
  public squat(): boolean {
    return this.data.exercise.slug === 'squat';
  }

  @SubScore.H.Penalty
  @SubScore.Binary
  public anyUnilaterals(): boolean {
    return false;
  }
}

export class Selector {
  constructor(
    private candidateSet: { slug: string }[],
    private scoreOptions: IScoreOptions
  ) { }

  private successorDataFactory = (_node: Node<Data>): Data[] =>
    this.candidateSet.map(exercise => ({ id: exercise.slug, exercise }));

  public select(goal: Goal): Data[] | null {
    return new AStar(
      new NodeFactory(
        new ScoreFactory(SelectorScore, this.scoreOptions),
        this.successorDataFactory
      )
    ).searchFromRoot(goal);
  }
}

const result2 = new Selector([], {
  cost: {
    discount: { squat: 0.5 },
    penalty: {},
  },
  heuristic: {
    discount: {},
    penalty: {
      anyUnilaterals: 0.5
    },
  },
}).select(new Goal());
console.log(result2);

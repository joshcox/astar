import { Score } from "score";
import { Node, IData, IGoal, AStar, IScoreOptions, IScore, Cost, Binary, Heuristic } from "../src/index";

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

@Score
class SelectorScore implements IScore {
  constructor(private data: Data, private goal: Goal, public options: IScoreOptions) { }

  public cost = () => 1;
  public heuristic = () => (this.goal.size ?? 0) - this.data.id.length;

  @Cost.Discount
  @Binary
  public squat(): boolean {
    return this.data.exercise.slug === 'squat';
  }

  @Heuristic.Penalty
  @Binary
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
    return new AStar({
      Score: SelectorScore,
      scoreOptions: this.scoreOptions,
      successors: this.successorDataFactory,
    }).searchFromRoot(goal);
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

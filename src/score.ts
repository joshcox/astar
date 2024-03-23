import { Binary, CALCULATOR_METHODS, Discount, Penalty } from "score.decorators";
import { IData, IGoal, IScore, ScoreFactory } from "types";

export interface ScoreOptions {
  discounts: Record<string, number>;
  penalties: Record<string, number>;
}


interface SubScores {
  cost: {
    discounts: Array<() => number>;
  };
  heuristic: {
    penalties: Array<() => number>;
  };
}

export abstract class Score implements IScore {
  static Binary = Binary;

  static Cost = {
    Discount,
  };

  static Heuristic = {
    Penalty
  };

  constructor(
    protected readonly data: IData,
    protected readonly goal: IGoal,
    public options: ScoreOptions,
  ) {
    (Reflect.getMetadata(CALCULATOR_METHODS, this.constructor.prototype) || [])
      .forEach(this.registerSubscore);
  }

  abstract baseCost(): number;
  abstract baseHeuristic(): number;

  static factory(
    this: new (node: IData, goal: IGoal, options: ScoreOptions) => IScore,
    goal: IGoal,
    options: ScoreOptions
  ): ReturnType<ScoreFactory<IGoal>> {
    return node => new this(node, goal, options);
  }

  private subScores: SubScores = {
    cost: {
      discounts: [],
    },
    heuristic: {
      penalties: [],
    },
  };

  private registerSubscore = ({ type, method }: any): number => {
    const boundMethod = method.bind(this);
    switch (type) {
      case 'discount':
        return this.subScores.cost.discounts.push(boundMethod);
      case 'penalty':
        return this.subScores.heuristic.penalties.push(boundMethod);
      default: throw new Error(`Unknown calculator type: ${type}`);
    }
  };

  public cost(): number {
    return this.baseCost() - this.calculateCostDiscount();
  }

  private calculateCostDiscount(): number {
    const discounts = this.subScores.cost.discounts;
    return Math.max(discounts.reduce((acc, d) => acc + d(), 0), 0);
  }

  public heuristic(): number {
    return this.baseHeuristic() + this.calculateHeuristicPenalty();
  }

  private calculateHeuristicPenalty(): number {
    const penalties = this.subScores.heuristic.penalties;
    return Math.max(penalties.reduce((acc, p) => acc + p(), 0), 0);
  }
}

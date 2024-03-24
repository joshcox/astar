import { Decorators, getSubScores } from "./score.decorators";
import { IData, IGoal, IScore, IScoreOptions } from "./types";

type Stash = {
  cost: {
    discount: Array<() => number>,
    penalty: Array<() => number>,
  },
  heuristic: {
    discount: Array<() => number>,
    penalty: Array<() => number>,
  },
};

const sum = (nums: number[]): number =>
  Math.max(nums.reduce((acc, n) => acc + n, 0), 0);

export const SubScore = Decorators;

export abstract class Score implements IScore {
  abstract baseCost(): number;
  abstract baseHeuristic(): number;

  constructor(
    protected readonly data: IData,
    protected readonly goal: IGoal,
    public options: IScoreOptions,
  ) {
    getSubScores(this.constructor.prototype)
      .forEach(({ classification, method }) => {
        const { type, modifier } = classification;
        this.stash[type][modifier].push(method);
      });
  }

  private stash: Stash = {
    cost: { discount: [], penalty: [] },
    heuristic: { penalty: [], discount: [] },
  };

  public cost(): number {
    return this.baseCost()
      - this.calculateCostDiscount()
      + this.calculateCostPenalty();
  }

  private calculateCostDiscount(): number {
    return sum(this.stash.cost.discount.map(d => d()));
  }

  private calculateCostPenalty(): number {
    return sum(this.stash.cost.penalty.map(p => p()));
  }

  public heuristic(): number {
    return this.baseHeuristic()
      - this.calculateHeuristicDiscount()
      + this.calculateHeuristicPenalty();
  }

  private calculateHeuristicDiscount(): number {
    return sum(this.stash.heuristic.discount.map(d => d()));
  }

  private calculateHeuristicPenalty(): number {
    return sum(this.stash.heuristic.penalty.map(p => p()));
  }
}

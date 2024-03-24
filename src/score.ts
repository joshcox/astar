import { SubScoreDecorators, SubScores, initializeSubScores, registerSubScores } from "score.decorators";
import { IData, IGoal, IScore, IScoreOptions } from "types";

const sum = (nums: number[]): number =>
  Math.max(nums.reduce((acc, n) => acc + n, 0), 0);

export abstract class Score implements IScore {
  abstract baseCost(): number;
  abstract baseHeuristic(): number;

  constructor(
    protected readonly data: IData,
    protected readonly goal: IGoal,
    public options: IScoreOptions,
  ) {
    registerSubScores(this);
  }

  static Sub = SubScoreDecorators;

  public subScores: SubScores = initializeSubScores();

  public cost(): number {
    return this.baseCost()
      - this.calculateCostDiscount()
      + this.calculateCostPenalty();
  }

  private calculateCostDiscount(): number {
    return sum(this.subScores.cost.discounts.map(d => d()));
  }

  private calculateCostPenalty(): number {
    return sum(this.subScores.cost.penalties.map(p => p()));
  }

  public heuristic(): number {
    return this.baseHeuristic()
      - this.calculateHeuristicDiscount()
      + this.calculateHeuristicPenalty();
  }

  private calculateHeuristicDiscount(): number {
    return sum(this.subScores.heuristic.discounts.map(d => d()));
  }

  private calculateHeuristicPenalty(): number {
    return sum(this.subScores.heuristic.penalties.map(p => p()));
  }
}

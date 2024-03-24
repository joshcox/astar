import { SubScoreDecorators, SubScoreTypes } from "score.decorators";
import { IData, IGoal, IScore, IScoreOptions } from "types";

export const CALCULATOR_METHODS = Symbol('Calculators');

export abstract class Score implements IScore {
  abstract baseCost(): number;
  abstract baseHeuristic(): number;

  constructor(
    protected readonly data: IData,
    protected readonly goal: IGoal,
    public options: IScoreOptions,
  ) {
    (Reflect.getMetadata(CALCULATOR_METHODS, this.constructor.prototype) || [])
      .forEach(this.registerSubscore);
  }

  static Sub = SubScoreDecorators;

  private subScores = {
    cost: {
      discounts: <Array<() => number>>[],
      penalties: <Array<() => number>>[],
    },
    heuristic: {
      penalties: <Array<() => number>>[],
      discounts: <Array<() => number>>[],
    },
  };

  private registerSubscore = ({ type, method }: { type: SubScoreTypes, method: () => number }): number => {
    const boundMethod = method.bind(this);
    switch (type) {
      case 'cost_discount':
        return this.subScores.cost.discounts.push(boundMethod);
      case 'cost_penalty':
        return this.subScores.cost.penalties.push(boundMethod);
      case 'heuristic_discount':
        return this.subScores.heuristic.discounts.push(boundMethod);
      case 'heuristic_penalty':
        return this.subScores.heuristic.penalties.push(boundMethod);
      default: {
        throw new Error(`Unknown calculator type: ${type}`);
      }
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



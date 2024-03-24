import { IData, IGoal, IScore, IScoreConstructor, IScoreFactory } from "types";

const CALCULATOR_METHODS = Symbol('Calculators');

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
  abstract baseCost(): number;
  abstract baseHeuristic(): number;

  constructor(
    protected readonly data: IData,
    protected readonly goal: IGoal,
    public options: ScoreOptions,
  ) {
    (Reflect.getMetadata(CALCULATOR_METHODS, this.constructor.prototype) || [])
      .forEach(this.registerSubscore);
  }

  static Sub = {
    Cost: { Discount: SubScore('discount') },
    Heuristic: { Penalty: SubScore('penalty') },
    Util: { Binary },
  };

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

export class ScoreFactory implements IScoreFactory {
  constructor(
    private Score: IScoreConstructor,
    protected options: ScoreOptions,
  ) { }

  createScore(goal: IGoal, data: IData): IScore {
    return new this.Score(data, goal, this.options);
  }
}

function SubScore(type: 'discount' | 'penalty'): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor): void => {
    const weightName = typeof key === 'string'
      ? key
      : key.description;

    const originalMethod = descriptor.value;
    descriptor.value = function (this: Score, ...args: any[]): number {
      const weights = type === 'discount'
        ? this.options.discounts
        : this.options.penalties;
      return originalMethod.apply(this, args) * (weights[weightName] ?? 0);
    };

    Reflect.defineMetadata(
      CALCULATOR_METHODS,
      [
        ...(Reflect.getMetadata(CALCULATOR_METHODS, target) || []),
        { type, key: weightName, method: descriptor.value },
      ],
      target,
    );
  }
}

function Binary(_: any, __: string | symbol, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = function (this: Score, ...args: any[]): number {
    return originalMethod.apply(this, args) ? 1 : 0;
  };
};

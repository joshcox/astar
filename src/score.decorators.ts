import { Score } from "score";

export const CALCULATOR_METHODS = Symbol('Calculators');

export type SubScoreTypes = 'cost_discount' | 'cost_penalty' | 'heuristic_discount' | 'heuristic_penalty';

export type SubScoreMetadata = { type: SubScoreTypes, key: string, method: () => number };

function SubScore(type: SubScoreTypes): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor): void => {
    const weightName = typeof key === 'string'
      ? key
      : key.description;

    const originalMethod = descriptor.value;
    descriptor.value = function (this: Score, ...args: any[]): number {
      let weights: Record<string, number>;

      switch (type) {
        case 'cost_discount':
          weights = this.options.cost.discounts;
          break;
        case 'cost_penalty':
          weights = this.options.cost.penalties;
          break;
        case 'heuristic_discount':
          weights = this.options.heuristic.discounts;
          break;
        case 'heuristic_penalty':
          weights = this.options.heuristic.penalties;
          break;
        default:
          throw new Error(`Unknown subscore type: ${type}`);
      }

      return originalMethod.apply(this, args) * (weights[weightName] ?? 0);
    };

    Reflect.defineMetadata(CALCULATOR_METHODS, [
      ...(Reflect.getMetadata(CALCULATOR_METHODS, target) || []),
      {
        type,
        key: weightName,
        method: descriptor.value,
      } satisfies SubScoreMetadata,
    ], target);
  };
}

function Binary(_: any, __: string | symbol, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = function (this: Score, ...args: any[]): number {
    return originalMethod.apply(this, args) ? 1 : 0;
  };
}

export const SubScoreDecorators = {
  Binary,
  G: {
    Discount: SubScore('cost_discount'),
    Penalty: SubScore('cost_penalty'),
  },
  H: {
    Discount: SubScore('heuristic_discount'),
    Penalty: SubScore('heuristic_penalty')
  }
};

export type SubScores = {
  cost: {
    discounts: Array<() => number>,
    penalties: Array<() => number>,
  },
  heuristic: {
    penalties: Array<() => number>,
    discounts: Array<() => number>,
  },
};

export const initializeSubScores = (): SubScores => ({
  cost: { discounts: [], penalties: [] },
  heuristic: { penalties: [], discounts: [] },
});

export const registerSubScores = (score: Score) => {
  (Reflect.getMetadata(CALCULATOR_METHODS, Score.prototype) || [])
      .forEach(({ type, method }: { type: SubScoreTypes, method: () => number }): number => {
        const boundMethod = method.bind(this);
        switch (type) {
          case 'cost_discount':
            return score.subScores.cost.discounts.push(boundMethod);
          case 'cost_penalty':
            return score.subScores.cost.penalties.push(boundMethod);
          case 'heuristic_discount':
            return score.subScores.heuristic.discounts.push(boundMethod);
          case 'heuristic_penalty':
            return score.subScores.heuristic.penalties.push(boundMethod);
          default: {
            throw new Error(`Unknown SubScore type: ${type}`);
          }
        }
      });
}

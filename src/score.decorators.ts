import { Score, CALCULATOR_METHODS } from "score";

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

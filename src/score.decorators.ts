import { assertsIsNumber } from "./assertions";
import { Score } from "./score";

const SUBSCORES = Symbol('SubScores');

export const getSubScores = (target: any): Metadata[] => (Reflect.getMetadata(SUBSCORES, target) || []);

export const registerSubScore = (target: any, metadata: Metadata): void => {
  Reflect.defineMetadata(SUBSCORES, getSubScores(target).concat([metadata]), target);
};

type Type = 'cost' | 'heuristic';

type Modifier = 'discount' | 'penalty';

type Classification = `${Type}:${Modifier}`;

type ParsedClassification = { type: Type, modifier: Modifier };

const parseClassification = (classification: Classification): ParsedClassification => {
  const [type, modifier] = classification.split(':') as [Type, Modifier];
  return { type, modifier };
};

type Metadata = { classification: ParsedClassification, key: string, method: () => number };

function SubScore(classification: Classification): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor): void => {
    const weightName = typeof key === 'string'
      ? key
      : key.description;

    const sooper = descriptor.value;
    descriptor.value = function (this: Score, ...args: any[]): number {
      const result = sooper.apply(this, args);
      assertsIsNumber(result);
      const { type, modifier } = parseClassification(classification);
      const weight = this.options[type][modifier][weightName] ?? 0
      return result * weight;
    };

    registerSubScore(target, {
      classification: parseClassification(classification),
      key: weightName,
      method: descriptor.value,
    });
  };
}

function Binary(_: any, __: string | symbol, descriptor: PropertyDescriptor): void {
  const sooper = descriptor.value;
  descriptor.value = function (this: Score, ...args: any[]): number {
    return sooper.apply(this, args) ? 1 : 0;
  };
}

export const Decorators = {
  Binary,
  G: {
    Discount: SubScore('cost:discount'),
    Penalty: SubScore('cost:penalty'),
  },
  H: {
    Discount: SubScore('heuristic:discount'),
    Penalty: SubScore('heuristic:penalty')
  }
};

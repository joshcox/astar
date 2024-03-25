import { assertsIsNumber } from "./assertions";
import { IScoreOptions } from "./types";

const SUBSCORES = Symbol('SubScores');

export interface ModifierMethod { (): number }

type ModifierMetadata = { classification: ParsedClassification, key: string, method: ModifierMethod };

export const getModifiers = (target: Function): ModifierMetadata[] => {
  const subScores = Reflect.getMetadata(SUBSCORES, target);
  return subScores ?? [];
};

export const addModifier = (target: Function, metadata: ModifierMetadata): void => {
  Reflect.defineMetadata(SUBSCORES, getModifiers(target).concat([metadata]), target);
};

type SubScoreType = 'cost' | 'heuristic';

type ModifierType = 'discount' | 'penalty';

type Classification = `${SubScoreType}:${ModifierType}`;

type ParsedClassification = { type: SubScoreType, modifier: ModifierType };

const parseClassification = (classification: Classification): ParsedClassification => {
  const [type, modifier] = classification.split(':') as [SubScoreType, ModifierType];
  return { type, modifier };
};

function Modify(classification: Classification): MethodDecorator {
  return (target: Object, key: string | symbol, descriptor: PropertyDescriptor): void => {
    const name = typeof key === 'string'
      ? key
      : key.description;

    const sooper = descriptor.value;
    descriptor.value = function (this: { options: IScoreOptions }, ...args: any[]): number {
      const result = sooper.apply(this, args);
      assertsIsNumber(result);
      const { type, modifier } = parseClassification(classification);
      const weight = this.options?.[type]?.[modifier]?.[name] ?? 0
      return result * weight;
    };

    addModifier(target.constructor, {
      classification: parseClassification(classification),
      key: name,
      method: descriptor.value,
    });
  };
}

export function Binary(_: Object, __: string | symbol, descriptor: PropertyDescriptor): void {
  const sooper = descriptor.value;
  descriptor.value = function (...args: any[]): number {
    return sooper.apply(this, args) ? 1 : 0;
  };
}

export const Cost = {
  Discount: Modify('cost:discount'),
  Penalty: Modify('cost:penalty'),
};

export const Heuristic = {
  Discount: Modify('heuristic:discount'),
  Penalty: Modify('heuristic:penalty')
};

import { assertsIsNumber } from "./assertions";
import { IData, IGoal, IScore, IScoreConstructor, IScoreOptions } from "./types";

const SUBSCORES = Symbol('SubScores');

export const getSubScores = (target: any): Metadata[] => (Reflect.getMetadata(SUBSCORES, target) || []);

export const registerSubScore = (target: any, metadata: Metadata): void => {
  Reflect.defineMetadata(SUBSCORES, getSubScores(target).concat([metadata]), target);
};

interface SubScoreMethod {
  (): number;
}

type Stash = {
  cost: {
    base: Array<SubScoreMethod>,
    discount: Array<SubScoreMethod>,
    penalty: Array<SubScoreMethod>,
  },
  heuristic: {
    base: Array<SubScoreMethod>,
    discount: Array<SubScoreMethod>,
    penalty: Array<SubScoreMethod>,
  },
};

const SCORE = Symbol('Score');
export const Score = <Data extends IData, Goal extends IGoal, Score extends IScore>() =>
(target: IScoreConstructor<Data, Goal, Score>) => {
  const stash: Stash = {
    cost: { base: [], discount: [], penalty: [] },
    heuristic: { base: [], penalty: [], discount: [] },
  };

  const subScores = getSubScores(target);

  subScores.forEach(({ classification, method }) => {
    const { type, modifier } = classification;
    stash[type][modifier].push(method);
  });

  Reflect.defineMetadata(SCORE, stash, target);
};

const getScore = (target: any): Stash => Reflect.getMetadata(SCORE, target.constructor);

const sum = (nums: number[]): number =>
  Math.max(nums.reduce((acc, n) => acc + n, 0), 0);

export const cost = (target: IScore): number => {
  const stash = getScore(target);
  return target.cost()
    - sum(stash.cost.discount.map(d => d.apply(target)))
    + sum(stash.cost.penalty.map(p => p.apply(target)));
};

export const heuristic = (target: IScore): number => {
  const stash = getScore(target);
  return target.heuristic()
    - sum(stash.heuristic.discount.map(d => d.apply(target)))
    + sum(stash.heuristic.penalty.map(p => p.apply(target)));
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
    descriptor.value = function (this: { options: IScoreOptions }, ...args: any[]): number {
      const result = sooper.apply(this, args);
      assertsIsNumber(result);
      const { type, modifier } = parseClassification(classification);
      const weight = this.options[type][modifier][weightName] ?? 0
      return result * weight;
    };

    registerSubScore(target.constructor, {
      classification: parseClassification(classification),
      key: weightName,
      method: descriptor.value,
    });
  };
}

function Binary(_: any, __: string | symbol, descriptor: PropertyDescriptor): void {
  const sooper = descriptor.value;
  descriptor.value = function (...args: any[]): number {
    return sooper.apply(this, args) ? 1 : 0;
  };
}

export const Modifier = {
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

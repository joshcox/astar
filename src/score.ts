import { IScore } from "./types";
import { getModifiers, ModifierMethod } from "./score.modifier";

type Stash = {
  cost: {
    discount: ModifierMethod[];
    penalty: ModifierMethod[];
  };
  heuristic: {
    discount: ModifierMethod[];
    penalty: ModifierMethod[];
  };
};

const buildStash = (): Stash => ({
  cost: { discount: [], penalty: [] },
  heuristic: { penalty: [], discount: [] },
});

const SCORE = Symbol('Score');

export const Score = (target: Function) => {
  const subScores = getModifiers(target);

  const stash = subScores.reduce((stash, { classification, method }) => {
    const { type, modifier } = classification;
    stash[type][modifier].push(method);
    return stash;
  }, buildStash());

  Reflect.defineMetadata(SCORE, stash, target);
};

const getScore = (target: Function): Stash => {
  const stash = Reflect.getMetadata(SCORE, target);
  if (!stash) throw new Error('Must use @Score decorator to use cost or heuristic functions');
  return stash;
};

const sum = (nums: number[]): number => Math.max(nums.reduce((acc, n) => acc + n, 0), 0);

export const cost = (target: IScore): number => {
  const stash = getScore(target.constructor);
  return target.cost()
    - sum(stash.cost.discount.map(d => d.apply(target)))
    + sum(stash.cost.penalty.map(p => p.apply(target)));
};

export const heuristic = (target: IScore): number => {
  const stash = getScore(target.constructor);
  return target.heuristic()
    - sum(stash.heuristic.discount.map(d => d.apply(target)))
    + sum(stash.heuristic.penalty.map(p => p.apply(target)));
};

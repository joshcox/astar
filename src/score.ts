/**
 * @module score
 * @description
 * This module provides functionality for managing and calculating scores in the A* search algorithm.
 * It defines decorators and functions for handling cost and heuristic calculations, including
 * modifiers like discounts and penalties.
 *
 * The module plays a role in the A* implementation by:
 * 1. Providing a decorator to mark classes that implement scoring logic
 * 2. Managing score modifiers (discounts and penalties) for both cost and heuristic calculations
 * 3. Offering functions to calculate final cost and heuristic values
 */

import { IScore } from "./types";
import { assertsIsNumber, assertsIsString } from "./assertions";
import { IScoreWeights } from "./types";

const MODIFIERS = Symbol('Modifiers');

type ModifierDescriptor = {
  category: 'cost' | 'heuristic',
  effect: 'discount' | 'penalty'
};

interface ModifierMethod { (): number }

/**
 * Type definition for modifier metadata.
 * This includes the classification of the modifier, its key, and the method itself.
 * @typedef {Object} ModifierMetadata
 * @property {ModifierDescriptor} classification - The parsed classification of the modifier
 * @property {string} key - The key or name of the modifier
 * @property {ModifierMethod} method - The modifier method
 */
type ModifierMetadata = { classification: ModifierDescriptor, key: string, method: ModifierMethod };

/**
 * Retrieves all modifiers defined on a target class.
 * @param {Function} target - The constructor function of the class
 * @returns {ModifierMetadata[]} An array of modifier metadata
 */
const getModifiers = (target: Function): ModifierMetadata[] =>
  Reflect.getMetadata(MODIFIERS, target) ?? [];

/**
 * Adds a modifier to the target class's metadata.
 * @param {Function} target - The constructor function of the class
 * @param {ModifierMetadata} metadata - The metadata of the modifier to add
 */
const addModifier = (target: Function, metadata: ModifierMetadata): void =>
  Reflect.defineMetadata(MODIFIERS, getModifiers(target).concat([metadata]), target);

/**
 * Decorator factory for modifying score calculations.
 * This decorator applies the specified classification to the method and
 * adds it to the list of modifiers for the class.
 *
 * @param {ModifierDescriptor} classification - The classification of the score modifier.
 * @returns {MethodDecorator} A decorator function that modifies the method.
 */
function Modifier({ category, effect }: ModifierDescriptor): MethodDecorator {
  return (target: Object, key: string | symbol, descriptor: PropertyDescriptor): void => {
    assertsIsString(key);

    const sooper = descriptor.value;

    descriptor.value = function (this: { weights: IScoreWeights }, ...args: any[]): number {
      const result = sooper.apply(this, args);
      assertsIsNumber(result);
      // When no modifier weight is defined, the default is 0, which functionally disables the modifier
      const weight = this.weights?.[category]?.[effect]?.[key] ?? 0;
      return result * weight;
    };

    addModifier(target.constructor, {
      classification: { category, effect },
      key,
      method: descriptor.value,
    });
  };
}

/**
 * Decorator that converts a method's return value to a binary (0 or 1) value.
 * This is useful for boolean conditions in score calculations.
 *
 * @param {Object} _ - The target object (unused)
 * @param {string | symbol} __ - The property key (unused)
 * @param {PropertyDescriptor} descriptor - The property descriptor
 */
export function Binary(_: Object, __: string | symbol, descriptor: PropertyDescriptor): void {
  const sooper = descriptor.value;
  descriptor.value = function (...args: any[]): number {
    return sooper.apply(this, args) ? 1 : 0;
  };
}

/**
 * Object containing decorators for cost modifications.
 * @namespace
 */
export const Cost = {
  /**
   * Decorator for applying a discount to the cost calculation.
   * @type {MethodDecorator}
   */
  Discount: Modifier({ category: 'cost', effect: 'discount' }),

  /**
   * Decorator for applying a penalty to the cost calculation.
   * @type {MethodDecorator}
   */
  Penalty: Modifier({ category: 'cost', effect: 'penalty' }),
};

/**
 * Object containing decorators for heuristic modifications.
 * @namespace
 */
export const Heuristic = {
  /**
   * Decorator for applying a discount to the heuristic calculation.
   * @type {MethodDecorator}
   */
  Discount: Modifier({ category: 'heuristic', effect: 'discount' }),

  /**
   * Decorator for applying a penalty to the heuristic calculation.
   * @type {MethodDecorator}
   */
  Penalty: Modifier({ category: 'heuristic', effect: 'penalty' }),
};

/**
 * Type definition for the Stash object, which holds arrays of modifier methods for cost and heuristic calculations.
 */
type Stash = {
  cost: {
    discount: [name: string, method: ModifierMethod][];
    penalty: [name: string, method: ModifierMethod][];
  };
  heuristic: {
    discount: [name: string, method: ModifierMethod][];
    penalty: [name: string, method: ModifierMethod][];
  };
};

/**
 * Creates an empty Stash object with initialized arrays for modifiers.
 * @returns {Stash} An empty Stash object
 * @private
 */
const buildStash = (): Stash => ({
  cost: { discount: [], penalty: [] },
  heuristic: { penalty: [], discount: [] },
});

/**
 * Symbol used as a key to store score metadata on decorated classes.
 * @constant {Symbol}
 * @private
 */
const COMPUTE_SCORE = Symbol('computeScoreMethod');
const COMPUTED_SCORE = Symbol('computedScore');
const COMPUTE_SUBSCORES = Symbol('computeSubScoresMethod');
const COMPUTED_SUBSCORES = Symbol('computedSubScores');


// Add this new type definition
type ComputedScores = {
  baseCost: number;
  baseHeuristic: number;
  modifiers: {
    cost: { discount: Record<string, number>; penalty: Record<string, number> };
    heuristic: { discount: Record<string, number>; penalty: Record<string, number> };
  };
};

function computeSubScores(this: IScore & { [COMPUTED_SUBSCORES]: ComputedScores, [COMPUTED_SCORE]: number }, stash: Stash): ComputedScores {
  return {
    baseCost: this.cost(),
    baseHeuristic: this.heuristic(),
    modifiers: {
      cost: {
        discount: stash.cost.discount.reduce((acc, [name, method]) => ({ ...acc, [name]: method.apply(this) }), {}),
        penalty: stash.cost.penalty.reduce((acc, [name, method]) => ({ ...acc, [name]: method.apply(this) }), {})
      },
      heuristic: {
        discount: stash.heuristic.discount.reduce((acc, [name, method]) => ({ ...acc, [name]: method.apply(this) }), {}),
        penalty: stash.heuristic.penalty.reduce((acc, [name, method]) => ({ ...acc, [name]: method.apply(this) }), {})
      }
    }
  };
};

function computeScore(this: IScore & { [COMPUTED_SUBSCORES]: ComputedScores, [COMPUTED_SCORE]: number }, computedSubScores: ComputedScores): number {
  const cost = computedSubScores.baseCost
    - sum(Object.values(computedSubScores.modifiers.cost.discount))
    + sum(Object.values(computedSubScores.modifiers.cost.penalty));

  const heuristic = computedSubScores.baseHeuristic
    - sum(Object.values(computedSubScores.modifiers.heuristic.discount))
    + sum(Object.values(computedSubScores.modifiers.heuristic.penalty));

  return cost + heuristic;
}

type DecoratedIScore = IScore & {
  [COMPUTE_SUBSCORES]: () => ComputedScores,
  [COMPUTED_SUBSCORES]: ComputedScores,
  [COMPUTE_SCORE]: () => number,
  [COMPUTED_SCORE]: number
};


/**
 * Decorator function to mark a class as a score provider.
 * It collects all modifier methods defined in the class and stores them in metadata.
 *
 * @param {Function} target - The constructor function of the decorated class
 */
export const Score = (target: Function) => {
  const modifiers = getModifiers(target);

  const stash = modifiers.reduce((stash, { classification, key, method }) => {
    const { category, effect } = classification;
    stash[category][effect].push([key, method]);
    return stash;
  }, buildStash());

  // Decorate the target class with the ability to compute sub scores
  target.prototype[COMPUTE_SUBSCORES] = function (this: DecoratedIScore) {
    if (typeof this[COMPUTED_SUBSCORES] !== 'object') {
      this[COMPUTED_SUBSCORES] = computeSubScores.call(this, stash);
    }

    return this[COMPUTED_SUBSCORES];
  };

  // Decorate the target class with the ability to compute the final score
  target.prototype[COMPUTE_SCORE] = function (this: DecoratedIScore) {
    if (typeof this[COMPUTED_SCORE] !== 'number') {
      this[COMPUTED_SCORE] = computeScore.call(this, this[COMPUTE_SUBSCORES]());
    }

    return this[COMPUTED_SCORE];
  };
};

/**
 * Calculates the sum of an array of numbers, ensuring the result is non-negative.
 * @param {number[]} nums - Array of numbers to sum
 * @returns {number} The sum of the input numbers, or 0 if the sum is negative
 * @private
 */
const sum = (nums: number[]): number => Math.max(nums.reduce((acc, n) => acc + n, 0), 0);

// Add this new function
export const score = (target: any): number => {
  if (typeof target[COMPUTE_SCORE] !== 'function') {
    throw new Error('Must use @Score decorator to use score function');
  }
  return target[COMPUTE_SCORE]();
};

export const verboseScore = (target: any): { score: number, subScores: ComputedScores } => {
  if (typeof target[COMPUTE_SCORE] !== 'function') {
    throw new Error('Must use @Score decorator to use score function');
  }
  return {
    score: target[COMPUTE_SCORE](),
    subScores: target[COMPUTE_SUBSCORES](),
  };
};

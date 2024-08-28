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
const SCORE = Symbol('Score');

/**
 * Decorator function to mark a class as a score provider.
 * It collects all modifier methods defined in the class and stores them in metadata.
 *
 * @param {Function} target - The constructor function of the decorated class
 */
export const Score = (target: Function) => {
  const subScores = getModifiers(target);

  const stash = subScores.reduce((stash, { classification, method }) => {
    const { category, effect } = classification;
    stash[category][effect].push(method);
    return stash;
  }, buildStash());

  Reflect.defineMetadata(SCORE, stash, target);
};

/**
 * Retrieves the score metadata (Stash) from a given target.
 * @param {Function} target - The constructor function to retrieve metadata from
 * @returns {Stash} The score metadata
 * @throws {Error} If the Score decorator hasn't been applied to the target
 * @private
 */
const getScore = (target: Function): Stash => {
  const stash = Reflect.getMetadata(SCORE, target);
  if (!stash) throw new Error('Must use @Score decorator to use cost or heuristic functions');
  return stash;
};

/**
 * Calculates the sum of an array of numbers, ensuring the result is non-negative.
 * @param {number[]} nums - Array of numbers to sum
 * @returns {number} The sum of the input numbers, or 0 if the sum is negative
 * @private
 */
const sum = (nums: number[]): number => Math.max(nums.reduce((acc, n) => acc + n, 0), 0);

/**
 * Calculates the final cost value for a given score target.
 * This function applies all registered cost modifiers (discounts and penalties).
 *
 * @param {IScore} target - The score object to calculate the cost for
 * @returns {number} The final calculated cost value
 */
export const cost = (target: IScore): number => {
  const stash = getScore(target.constructor);
  return target.cost()
    - sum(stash.cost.discount.map(d => d.apply(target)))
    + sum(stash.cost.penalty.map(p => p.apply(target)));
};

/**
 * Calculates the final heuristic value for a given score target.
 * This function applies all registered heuristic modifiers (discounts and penalties).
 *
 * @param {IScore} target - The score object to calculate the heuristic for
 * @returns {number} The final calculated heuristic value
 */
export const heuristic = (target: IScore): number => {
  const stash = getScore(target.constructor);
  return target.heuristic()
    - sum(stash.heuristic.discount.map(d => d.apply(target)))
    + sum(stash.heuristic.penalty.map(p => p.apply(target)));
};

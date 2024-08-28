import { assertsIsNumber, assertsIsString } from "./assertions";
import { IScoreOptions } from "./types";

const MODIFIERS = Symbol('Modifiers');

type ModifierDescriptor = {
  category: 'cost' | 'heuristic',
  effect: 'discount' | 'penalty'
};

export interface ModifierMethod { (): number }

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
export const getModifiers = (target: Function): ModifierMetadata[] =>
  Reflect.getMetadata(MODIFIERS, target) ?? [];

/**
 * Adds a modifier to the target class's metadata.
 * @param {Function} target - The constructor function of the class
 * @param {ModifierMetadata} metadata - The metadata of the modifier to add
 */
export const addModifier = (target: Function, metadata: ModifierMetadata): void =>
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

    descriptor.value = function (this: { options: IScoreOptions }, ...args: any[]): number {
      const result = sooper.apply(this, args);
      assertsIsNumber(result);
      const weight = this.options?.[category]?.[effect]?.[key] ?? 0;
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

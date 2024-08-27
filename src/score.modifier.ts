import { assertsIsNumber } from "./assertions";
import { IScoreOptions } from "./types";

const SUBSCORES = Symbol('SubScores');

type SubScoreType = 'cost' | 'heuristic';

type ModifierType = 'discount' | 'penalty';

type Classification = `${SubScoreType}:${ModifierType}`;

type ParsedClassification = { type: SubScoreType, modifier: ModifierType };

/**
 * Parses a classification string into a ParsedClassification object.
 * @param {Classification} classification - The classification string to parse
 * @returns {ParsedClassification} The parsed classification object
 * @private
 */
const parseClassification = (classification: Classification): ParsedClassification => {
  const [type, modifier] = classification.split(':') as [SubScoreType, ModifierType];
  return { type, modifier };
};

export interface ModifierMethod { (): number }

/**
 * Type definition for modifier metadata.
 * This includes the classification of the modifier, its key, and the method itself.
 * @typedef {Object} ModifierMetadata
 * @property {ParsedClassification} classification - The parsed classification of the modifier
 * @property {string} key - The key or name of the modifier
 * @property {ModifierMethod} method - The modifier method
 */
type ModifierMetadata = { classification: ParsedClassification, key: string, method: ModifierMethod };

/**
 * Retrieves all modifiers defined on a target class.
 * @param {Function} target - The constructor function of the class
 * @returns {ModifierMetadata[]} An array of modifier metadata
 */
export const getModifiers = (target: Function): ModifierMetadata[] => {
  const subScores = Reflect.getMetadata(SUBSCORES, target);
  return subScores ?? [];
};

/**
 * Adds a modifier to the target class's metadata.
 * @param {Function} target - The constructor function of the class
 * @param {ModifierMetadata} metadata - The metadata of the modifier to add
 */
export const addModifier = (target: Function, metadata: ModifierMetadata): void => {
  Reflect.defineMetadata(SUBSCORES, getModifiers(target).concat([metadata]), target);
};

/**
 * Decorator factory for modifying score calculations.
 * This decorator applies the specified classification to the method and
 * adds it to the list of modifiers for the class.
 *
 * @param {Classification} classification - The classification of the score modifier.
 * @returns {MethodDecorator} A decorator function that modifies the method.
 */
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
  Discount: Modify('cost:discount'),

  /**
   * Decorator for applying a penalty to the cost calculation.
   * @type {MethodDecorator}
   */
  Penalty: Modify('cost:penalty'),
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
  Discount: Modify('heuristic:discount'),

  /**
   * Decorator for applying a penalty to the heuristic calculation.
   * @type {MethodDecorator}
   */
  Penalty: Modify('heuristic:penalty')
};

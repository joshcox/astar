/**
 * @module memoize
 * @description
 * This module provides a memoization decorator function that can be used to cache the results of class methods.
 * Memoization is an optimization technique that stores the results of expensive function calls and returns
 * the cached result when the same inputs occur again, improving performance for repetitive calculations.
 *
 * In the context of the A* search algorithm implementation, this memoization decorator can be particularly
 * useful for caching the results of cost and heuristic calculations, which may be called multiple times
 * for the same node during the search process.
 *
 * @example
 * class ExampleClass {
 *   @memoize
 *   expensiveCalculation(input: number): number {
 *     // Perform some expensive calculation
 *     return input * 2;
 *   }
 * }
 */

/**
 * A decorator function that memoizes (caches) the result of a class method.
 * Once a method is called with certain arguments, its result is stored and returned
 * for subsequent calls with the same arguments, avoiding redundant computations.
 *
 * @function memoize
 * @param {any} _ - The target object (unused in this implementation)
 * @param {string} propertyKey - The name of the method being decorated
 * @param {PropertyDescriptor} descriptor - The property descriptor for the method
 * @returns {PropertyDescriptor} The modified property descriptor with memoization logic
 *
 * @remarks
 * - This decorator creates a unique Symbol for each memoized method to store the cached result.
 * - The memoized result is stored as a non-enumerable, non-configurable, and non-writable property on the instance.
 * - This implementation only works for methods without parameters or where the parameters don't affect the result.
 * - For methods where parameters matter, a more complex memoization strategy would be needed.
 *
 * @example
 * class Node {
 *   @memoize
 *   calculateScore(): number {
 *     // Expensive calculation
 *     return Math.random();
 *   }
 * }
 */
export function memoize(_: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const memoKey = Symbol(`memoized_${propertyKey}`);

  descriptor.value = function (this: any, ...args: any[]) {
    if (this[memoKey] !== undefined) {
      return this[memoKey];
    }

    const result = originalMethod.apply(this, args);
    Object.defineProperty(this, memoKey, {
      value: result,
      configurable: false,
      enumerable: false,
      writable: false
    });

    return result;
  };

  return descriptor;
}

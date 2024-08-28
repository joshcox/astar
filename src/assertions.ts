/**
 * @module assertions
 * @description
 * This module provides utility functions for type assertions in TypeScript.
 *
 * These assertions are useful in scenarios where TypeScript's static type checking
 * needs to be complemented with runtime checks, such as when dealing with external data or
 * in complex type scenarios.
 */

/**
 * Type guard function to check if a value is defined (not null or undefined).
 *
 * @template T - The type of the value being checked
 * @param {T | undefined | null} value - The value to check
 * @returns {value is T} - Type predicate indicating whether the value is defined
 * @private
 */
const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

/**
 * Assertion function to ensure a value is defined (not null or undefined).
 * Throws an error if the value is undefined or null.
 *
 * @template T - The type of the value being asserted
 * @param {T | undefined | null} value - The value to assert
 * @throws {Error} Throws an error if the value is undefined or null
 * @example
 * import { assertsIsDefined } from './assertions';
 *
 * function processValue(value: string | undefined) {
 *   assertsIsDefined(value);
 *   // Now TypeScript knows that value is definitely string
 *   console.log(value.toUpperCase());
 * }
 */
export function assertsIsDefined<T>(value: T | undefined | null): asserts value is T {
  if (!isDefined(value)) {
    throw new Error('Value is unexpectedly undefined');
  }
}

/**
 * Type guard function to check if a value is a number.
 *
 * @param {any} value - The value to check
 * @returns {value is number} - Type predicate indicating whether the value is a number
 * @private
 */
const isNumber = (value: any): value is number => typeof value === 'number';

/**
 * Assertion function to ensure a value is a number.
 * Throws an error if the value is not a number.
 *
 * @param {any} value - The value to assert
 * @throws {Error} Throws an error if the value is not a number
 * @example
 * import { assertsIsNumber } from './assertions';
 *
 * function calculateArea(radius: any) {
 *   assertsIsNumber(radius);
 *   // Now we can safely use radius in mathematical operations
 *   return Math.PI * radius * radius;
 * }
 */
export function assertsIsNumber(value: any): asserts value is number {
  if (!isNumber(value)) {
    throw new Error('Value is not a number');
  }
}

/**
 * Type guard function to check if a value is a string.
 *
 * @param {any} value - The value to check
 * @returns {value is string} - Type predicate indicating whether the value is a string
 * @private
 */
const isString = (value: any): value is string => typeof value === 'string';

/**
 * Assertion function to ensure a value is a string.
 * Throws an error if the value is not a string.
 *
 * @param {any} value - The value to assert
 * @throws {Error} Throws an error if the value is not a string
 * @example
 * import { assertsIsString } from './assertions';
 *
 * function processName(name: any) {
 *   assertsIsString(name);
 *   // Now we can safely use string methods on name
 *   console.log(name.toUpperCase());
 * }
 */
export function assertsIsString(value: any): asserts value is string {
  if (!isString(value)) {
    throw new Error('Value is not a string');
  }
}

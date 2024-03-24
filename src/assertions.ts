const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export function assertsIsDefined<T>(value: T | undefined | null): asserts value is T {
  if (!isDefined(value)) {
    throw new Error('Value is unexpectedly undefined');
  }
}

const isNumber = (value: any): value is number => typeof value === 'number';

export function assertsIsNumber(value: any): asserts value is number {
  if (!isNumber(value)) {
    throw new Error('Value is not a number');
  }
}

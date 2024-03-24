const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export function assertsIsDefined<T>(value: T | undefined | null): asserts value is T {
  if (!isDefined(value)) {
    throw new Error('Value is unexpectedly undefined');
  }
}

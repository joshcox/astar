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

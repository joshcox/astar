import { IScore } from "types";

export const CALCULATOR_METHODS = Symbol('Calculators');

const Weighted =
  (type: 'discount' | 'penalty') =>
    (): MethodDecorator =>
      (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
      ): void => {
        const weightName = typeof propertyKey === 'string'
          ? propertyKey
          : propertyKey.description;

        const originalMethod = descriptor.value;

        descriptor.value = function (
          this: IScore,
          ...args: any[]
        ): number {
          const weights =
            type === 'discount' ? this.options.discounts : this.options.penalties;
          return originalMethod.apply(this, args) * (weights[weightName] ?? 0);
        };

        Reflect.defineMetadata(
          CALCULATOR_METHODS,
          [
            ...(Reflect.getMetadata(CALCULATOR_METHODS, target) || []),
            { type, key: weightName, method: descriptor.value },
          ],
          target,
        );
      };

export const Discount = Weighted('discount');

export const Penalty = Weighted('penalty');

export const Binary = (): MethodDecorator =>
  (
    _target: any,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: IScore, ...args: any[]): number {
      return originalMethod.apply(this, args) ? 1 : 0;
    };
  };

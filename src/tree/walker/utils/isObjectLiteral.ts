import { Dictionary } from '@stoplight/types';

export function isObject(maybeObj: unknown): maybeObj is object {
  return maybeObj !== void 0 && maybeObj !== null && typeof maybeObj === 'object';
}

export function isPrimitive(
  maybePrimitive: unknown,
): maybePrimitive is string | number | boolean | undefined | null | symbol | bigint {
  return typeof maybePrimitive !== 'function' && !isObject(maybePrimitive);
}

export function isObjectLiteral(maybeObj: unknown): maybeObj is Dictionary<unknown> {
  if (isPrimitive(maybeObj) === true) return false;
  const proto = Object.getPrototypeOf(maybeObj);
  return proto === null || proto === Object.prototype;
}

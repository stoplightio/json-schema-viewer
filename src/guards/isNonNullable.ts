export function isNonNullable<T = unknown>(maybeNullable: T): maybeNullable is NonNullable<T> {
  return maybeNullable !== void 0 && maybeNullable !== null;
}

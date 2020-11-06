export function unwrapStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function unwrapArrayOrNull(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

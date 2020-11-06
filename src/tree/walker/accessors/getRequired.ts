function isStringOrNumber(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

export function getRequired(required: unknown): string[] | null {
  if (!Array.isArray(required)) return null;
  return required.filter(isStringOrNumber).map(String);
}

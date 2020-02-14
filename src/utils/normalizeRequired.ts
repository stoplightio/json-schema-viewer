import { Optional } from '@stoplight/types';

export const normalizeRequired = (required: unknown): Optional<string[]> => {
  if (!Array.isArray(required)) return;
  return required.filter(item => typeof item === 'string' || typeof item === 'number').map(String);
}

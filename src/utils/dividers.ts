import { Dictionary } from '@stoplight/types';
import { JSONSchema4CombinerName } from '../types';

export const DIVIDERS: Dictionary<string, JSONSchema4CombinerName> = {
  allOf: 'and',
  anyOf: 'and/or',
  oneOf: 'or',
};

import { Dictionary } from '@stoplight/types';
import { IType } from './shared';

export const PropertyTypeColors: Dictionary<string, IType['type']> = {
  object: 'text-blue-6 dark:text-blue-4',
  any: 'text-blue-5',
  array: 'text-green-6 dark:text-green-4',
  allOf: 'text-orange-5',
  anyOf: 'text-orange-5',
  oneOf: 'text-orange-5',
  null: 'text-orange-5',
  integer: 'text-red-7 dark:text-red-6',
  number: 'text-red-7 dark:text-red-6',
  boolean: 'text-red-4',
  binary: 'text-green-4',
  string: 'text-green-7 dark:text-green-5',
  $ref: 'text-purple-6 dark:text-purple-4',
};

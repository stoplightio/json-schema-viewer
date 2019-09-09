import { JSONSchema4 } from 'json-schema';
import { JSONSchema4CombinerName } from '../types';

export const getCombiner = (node: JSONSchema4): JSONSchema4CombinerName | void => {
  if ('allOf' in node) return 'allOf';
  if ('anyOf' in node) return 'anyOf';
  if ('oneOf' in node) return 'oneOf';
};

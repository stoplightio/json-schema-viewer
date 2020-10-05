import { JSONSchema4 } from 'json-schema';
import { JSONSchema4CombinerName } from '../types';

export const getCombiners = (node: JSONSchema4): JSONSchema4CombinerName[] | void => {
  let combiners: JSONSchema4CombinerName[] | void;

  if ('anyOf' in node) {
    // tslint:disable-next-line:prettier
    combiners ??= [];
    combiners.push('anyOf');
  }

  if ('oneOf' in node) {
    combiners ??= [];
    combiners.push('oneOf');
  }

  if ('allOf' in node) {
    combiners ??= [];
    combiners.push('allOf');
  }

  return combiners;
};

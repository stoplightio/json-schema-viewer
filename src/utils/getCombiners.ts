import { JSONSchema, JSONSchemaCombinerName } from '../types';

export const getCombiners = (node: JSONSchema): JSONSchemaCombinerName[] | void => {
  let combiners: JSONSchemaCombinerName[] | void;

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

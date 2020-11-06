import { JSONSchema4 } from 'json-schema';
import { SchemaCombinerName } from '../types';
import { Dictionary } from '@stoplight/types';

export function getCombiners(fragment: Dictionary<unknown, keyof JSONSchema4>): SchemaCombinerName[] | null  {
  let combiners: SchemaCombinerName[] | null = null;

  if (SchemaCombinerName.AnyOf in fragment) {
    // tslint:disable-next-line:prettier
    combiners ??= [];
    combiners.push(SchemaCombinerName.AnyOf);
  }

  if (SchemaCombinerName.OneOf in fragment) {
    combiners ??= [];
    combiners.push(SchemaCombinerName.OneOf);
  }

  if (SchemaCombinerName.AllOf in fragment) {
    combiners ??= [];
    combiners.push(SchemaCombinerName.AllOf);
  }

  return combiners;
}

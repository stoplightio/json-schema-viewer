import { SchemaCombinerName } from '@stoplight/json-schema-tree';

export function isCombiner(value: string): value is SchemaCombinerName {
  return value === SchemaCombinerName.OneOf || value === SchemaCombinerName.AnyOf || value === SchemaCombinerName.AllOf;
}

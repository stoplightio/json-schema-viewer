import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import { SpaceVals } from '@stoplight/mosaic';
import { Dictionary } from '@stoplight/types';

export const COMBINER_PRETTY_NAMES: Readonly<Dictionary<string, SchemaCombinerName>> = {
  [SchemaCombinerName.AllOf]: 'and',
  [SchemaCombinerName.AnyOf]: 'and/or',
  [SchemaCombinerName.OneOf]: 'or',
};

export const COMMON_JSON_SCHEMA_AND_OAS_FORMATS = {
  // strings are omitted because they are the default type to apply format to
  number: ['byte', 'int32', 'int64', 'float', 'double'],
  get integer() {
    return this.number;
  },
};

export const NESTING_OFFSET: SpaceVals = 3;

export const CARET_ICON_SIZE = 'sm';

export const COMBINER_NAME_MAP: Dictionary<string, SchemaCombinerName> = {
  allOf: 'all of',
  anyOf: 'any of',
  oneOf: 'one of',
};

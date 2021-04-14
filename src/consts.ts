import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import { Dictionary } from '@stoplight/types';

export const COMBINER_PRETTY_NAMES: Readonly<Dictionary<string, SchemaCombinerName>> = {
  [SchemaCombinerName.AllOf]: 'and',
  [SchemaCombinerName.AnyOf]: 'and/or',
  [SchemaCombinerName.OneOf]: 'or',
};

export const CARET_ICON_SIZE = 'xs';
export const CARET_ICON_BOX_DIMENSION = 12;
export const NESTING_OFFSET = 20;
export const CARET_OFFSET = NESTING_OFFSET;

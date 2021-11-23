import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import { NegativeSpaceVals, SpaceVals } from '@stoplight/mosaic';
import { Dictionary } from '@stoplight/types';

export const COMBINER_PRETTY_NAMES: Readonly<Dictionary<string, SchemaCombinerName>> = {
  [SchemaCombinerName.AllOf]: 'and',
  [SchemaCombinerName.AnyOf]: 'and/or',
  [SchemaCombinerName.OneOf]: 'or',
};

export const NESTING_OFFSET: SpaceVals = 6;
// @ts-expect-error: negative offset
export const NEGATIVE_NESTING_OFFSET: NegativeSpaceVals = -NESTING_OFFSET;

export const CARET_OFFSET = NEGATIVE_NESTING_OFFSET;
export const CARET_ICON_SIZE = 'xs';
export const CARET_ICON_BOX_DIMENSION = 3;

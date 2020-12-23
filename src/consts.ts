import { SchemaCombinerName, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { Dictionary } from '@stoplight/types';

export const PROPERTY_TYPE_COLORS: Readonly<Dictionary<string, SchemaNodeKind | SchemaCombinerName | '$ref'>> = {
  [SchemaNodeKind.Object]: 'text-blue-6 dark:text-blue-4',
  [SchemaNodeKind.Any]: 'text-blue-5',
  [SchemaNodeKind.Array]: 'text-green-6 dark:text-green-4',
  [SchemaCombinerName.AllOf]: 'text-orange-5',
  [SchemaCombinerName.AnyOf]: 'text-orange-5',
  [SchemaCombinerName.OneOf]: 'text-orange-5',
  [SchemaNodeKind.Null]: 'text-orange-5',
  [SchemaNodeKind.Integer]: 'text-red-7 dark:text-red-6',
  [SchemaNodeKind.Number]: 'text-red-7 dark:text-red-6',
  [SchemaNodeKind.Boolean]: 'text-red-4',
  [SchemaNodeKind.String]: 'text-green-7 dark:text-green-5',
  $ref: 'text-purple-6 dark:text-purple-4',
};

export const COMBINER_PRETTY_NAMES: Readonly<Dictionary<string, SchemaCombinerName>> = {
  [SchemaCombinerName.AllOf]: 'and',
  [SchemaCombinerName.AnyOf]: 'and/or',
  [SchemaCombinerName.OneOf]: 'or',
};

export const CARET_ICON_SIZE = 12;
export const CARET_ICON_BOX_DIMENSION = 20;
export const SCHEMA_ROW_OFFSET = 7;

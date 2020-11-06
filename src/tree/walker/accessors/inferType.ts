import { Dictionary } from '@stoplight/types';
import { SchemaNodeKind } from '../types';

export function inferType(fragment: Dictionary<unknown>): SchemaNodeKind | null {
  if ('properties' in fragment || 'additionalProperties' in fragment || 'patternProperties' in fragment) {
    return SchemaNodeKind.Object;
  }

  if ('items' in fragment || 'additionalItems' in fragment) {
    return SchemaNodeKind.Array;
  }

  return null;
}

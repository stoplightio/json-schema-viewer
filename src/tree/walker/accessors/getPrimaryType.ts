import { SchemaNodeKind } from '../../types';
import { Dictionary } from '@stoplight/types';

export function getPrimaryType(fragment: Dictionary<unknown, keyof JSONSchema4>, types: SchemaNodeKind[] | null) {
  if (types !== null) {
    if (types.includes(SchemaNodeKind.Object)) {
      return SchemaNodeKind.Object;
    }

    if (types.includes(SchemaNodeKind.Array)) {
      return SchemaNodeKind.Array;
    }

    if (types.length > 0) {
      return types[0];
    }

    return null;
  }

  return null;
}

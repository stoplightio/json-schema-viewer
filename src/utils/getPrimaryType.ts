import { JSONSchema4 } from 'json-schema';

import { SchemaKind, SchemaNode } from '../types';
import { inferType } from './inferType';

export function getPrimaryType(node: JSONSchema4 | SchemaNode) {
  if ('type' in node && node.type !== undefined) {
    if (Array.isArray(node.type)) {
      if (node.type.includes(SchemaKind.Object)) {
        return SchemaKind.Object;
      }

      if (node.type.includes(SchemaKind.Array)) {
        return SchemaKind.Array;
      }
    }

    return node.type;
  }

  return inferType(node);
}

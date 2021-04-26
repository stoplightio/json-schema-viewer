import { Optional } from '@stoplight/types';
import { JSONSchema, SchemaKind, SchemaNode } from '../types';

export function inferType(node: SchemaNode | JSONSchema): Optional<JSONSchema['type']> {
  if ('type' in node) {
    return node.type;
  }

  if ('properties' in node) {
    return SchemaKind.Object;
  }

  if ('items' in node) {
    return SchemaKind.Array;
  }

  return;
}

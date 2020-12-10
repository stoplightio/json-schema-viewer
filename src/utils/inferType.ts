import { Optional } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';

import { SchemaKind, SchemaNode } from '../types';

export function inferType(node: SchemaNode | JSONSchema4): Optional<JSONSchema4TypeName | JSONSchema4TypeName[]> {
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

import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { SchemaKind } from '../types';

export function inferType(node: JSONSchema4): JSONSchema4TypeName | JSONSchema4TypeName[] | undefined {
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

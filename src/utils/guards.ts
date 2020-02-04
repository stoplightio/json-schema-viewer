import { JSONSchema4 } from 'json-schema';
import { isObjectLike as _isObjectLike } from 'lodash-es';
import { IArrayNode, SchemaKind, SchemaNode } from '../types';

export const isArrayNodeWithItems = (
  node: SchemaNode,
): node is Omit<IArrayNode, 'items'> & { items: JSONSchema4 | JSONSchema4[] } =>
  'type' in node && 'items' in node && node.type === SchemaKind.Array && _isObjectLike(node.items);

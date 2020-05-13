import { JSONSchema4 } from 'json-schema';
import { isObjectLike as _isObjectLike } from 'lodash';
import { IArrayNode, ICombinerNode, IRefNode, SchemaKind, SchemaNode } from '../types';

export const isArrayNodeWithItems = (
  node: SchemaNode,
): node is Omit<IArrayNode, 'items'> & { items: JSONSchema4 | JSONSchema4[] } =>
  'type' in node && 'items' in node && node.type === SchemaKind.Array && _isObjectLike(node.items);

export const isRefNode = (node: SchemaNode): node is IRefNode => '$ref' in node;

export const hasRefItems = (node: SchemaNode): node is Omit<IArrayNode, 'items'> & { items: Omit<IRefNode, 'id'> } =>
  isArrayNodeWithItems(node) && '$ref' in node.items;

export const isCombinerNode = (node: SchemaNode): node is ICombinerNode => 'combiner' in node;

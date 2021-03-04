import { isReferenceNode, isRegularNode, SchemaNode, SchemaNodeKind } from '@stoplight/json-schema-tree';

import { isNonNullable } from '../guards/isNonNullable';
import { ComplexArrayNode, FlattenableNode, PrimitiveArrayNode } from './types';

export const isParentNode = (node: SchemaNode) => isRegularNode(node) && !!node.children && node.children.length > 0;

export function isFlattenableNode(node: SchemaNode): node is FlattenableNode {
  if (!isRegularNode(node)) return false;

  if (node.primaryType !== SchemaNodeKind.Array || !isNonNullable(node.children) || node.children.length === 0) {
    return false;
  }

  return (
    node.children.length === 1 &&
    (isRegularNode(node.children[0]) || (isReferenceNode(node.children[0]) && node.children[0].error !== null))
  );
}

export function isPrimitiveArray(node: SchemaNode): node is PrimitiveArrayNode {
  return isFlattenableNode(node) && isRegularNode(node.children[0]) && node.children[0].simple;
}

export function isComplexArray(node: SchemaNode): node is ComplexArrayNode {
  return isFlattenableNode(node) && isRegularNode(node.children[0]) && !node.children[0].simple;
}

/**
 * Returns the children of `node` that should be displayed in the tree.
 * Defaults to `node.children`, except for Arrays that get special handling (flattening).
 */
export function calculateChildrenToShow(node: SchemaNode): SchemaNode[] {
  if (!isRegularNode(node) || isPrimitiveArray(node)) {
    return [];
  }
  if (isComplexArray(node)) {
    // flatten the tree here, and show the properties of the item type directly
    return node.children[0].children ?? [];
  }
  return node.children ?? [];
}

export function isPropertyRequired(schemaNode: SchemaNode): boolean {
  const { parent } = schemaNode;
  if (parent === null || !isRegularNode(parent) || schemaNode.subpath.length === 0) {
    return false;
  }

  return !!parent.required?.includes(schemaNode.subpath[schemaNode.subpath.length - 1]);
}

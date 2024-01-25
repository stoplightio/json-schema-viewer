import { isPlainObject } from '@stoplight/json';
import {
  type MirroredSchemaNode,
  type ReferenceNode,
  type RegularNode,
  type SchemaNode,
  isBooleanishNode,
  isReferenceNode,
  isRegularNode,
  isRootNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { BooleanishNode } from '@stoplight/json-schema-tree/nodes/BooleanishNode';

import { isNonNullable } from '../guards/isNonNullable';
import type { ViewMode } from '../types';
import type {
  ArrayNode,
  ComplexArrayNode,
  ComplexDictionaryNode,
  DictionaryNode,
  FlattenableNode,
  PrimitiveArrayNode,
  PrimitiveDictionaryNode,
} from './types';

export type ChildNode = RegularNode | ReferenceNode | MirroredSchemaNode;

export const isNonEmptyParentNode = (
  node: SchemaNode,
): node is RegularNode & {
  children: ChildNode[] & { 0: ChildNode };
} => isRegularNode(node) && !!node.children && node.children.length > 0;

export function isFlattenableNode(node: SchemaNode): node is FlattenableNode {
  if (!isRegularNode(node)) return false;

  if ((!isArrayNode(node) && !isDictionaryNode(node)) || !isNonNullable(node.children) || node.children.length === 0) {
    return false;
  }

  return (
    node.children.length === 1 &&
    ((isRegularNode(node.children[0]) && (!isArrayNode(node) || !isDictionaryNode(node.children[0]))) ||
      (isReferenceNode(node.children[0]) && node.children[0].error !== null))
  );
}

export function isPrimitiveArray(node: SchemaNode): node is PrimitiveArrayNode {
  return isFlattenableNode(node) && isArrayNode(node) && isRegularNode(node.children[0]) && node.children[0].simple;
}

export function isPrimitiveDictionary(node: SchemaNode): node is PrimitiveDictionaryNode {
  return (
    isFlattenableNode(node) && isDictionaryNode(node) && isRegularNode(node.children[0]) && node.children[0].simple
  );
}

export function isComplexArray(node: SchemaNode): node is ComplexArrayNode {
  return isFlattenableNode(node) && isArrayNode(node) && isRegularNode(node.children[0]) && !node.children[0].simple;
}

export function isComplexDictionary(node: SchemaNode): node is ComplexDictionaryNode {
  return (
    isFlattenableNode(node) && isDictionaryNode(node) && isRegularNode(node.children[0]) && !node.children[0].simple
  );
}

export function isDictionaryNode(node: SchemaNode): node is DictionaryNode {
  return (
    isRegularNode(node) &&
    node.primaryType === SchemaNodeKind.Object &&
    isPlainObject(node.fragment.additionalProperties)
  );
}

export function isArrayNode(node: SchemaNode): node is ArrayNode {
  return isRegularNode(node) && node.primaryType === SchemaNodeKind.Array;
}

/**
 * Returns the children of `node` that should be displayed in a viewer or
 * editor. Defaults to `node.children`, except for Arrays that get special
 * handling (flattening).
 */
export function visibleChildren(node: SchemaNode): SchemaNode[] {
  if (!isRegularNode(node) || isPrimitiveArray(node) || isPrimitiveDictionary(node)) {
    return [];
  }
  if (isComplexArray(node) || isComplexDictionary(node)) {
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

function isValidViewMode(node: RegularNode, viewMode: ViewMode): boolean {
  const { validations } = node;

  if (!!validations.writeOnly === !!validations.readOnly) {
    return true;
  }

  return !((viewMode === 'read' && !!validations.writeOnly) || (viewMode === 'write' && !!validations.readOnly));
}

function isRenderableNode(node: BooleanishNode | RegularNode): boolean {
  if (node.parent === null) return true;

  if (isDictionaryNode(node.parent)) {
    // if dictionary, do not render explicitly defined properties
    return node.subpath.length !== 2 || node.subpath[0] !== 'properties';
  }

  // do not render additionalItems
  if (isArrayNode(node.parent)) {
    return node.subpath[0] !== 'additionalItems';
  }

  // do not render true/false additionalProperties
  if (isRegularNode(node.parent) && node.parent.primaryType === SchemaNodeKind.Object && isBooleanishNode(node)) {
    return !(node.subpath.length === 1 || node.subpath[0] === 'additionalProperties');
  }

  return true;
}

export function shouldNodeBeIncluded(node: SchemaNode, viewMode: ViewMode = 'standalone'): boolean {
  return (
    (isReferenceNode(node) || isRootNode(node) || isRenderableNode(node)) &&
    (!isRegularNode(node) || isValidViewMode(node, viewMode))
  );
}

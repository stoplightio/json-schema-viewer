import {
  isRegularNode,
  isRootNode,
  SchemaNode,
  SchemaTree as JsonSchemaTree,
  SchemaTreeOptions,
} from '@stoplight/json-schema-tree';
import type { JSONSchema4, JSONSchema7 } from 'json-schema';
import { isEqual } from 'lodash';

export function buildTree(schema: JSONSchema4 | JSONSchema7, options: Partial<SchemaTreeOptions> = {}) {
  const jsonSchemaTree = new JsonSchemaTree(schema, {
    mergeAllOf: true,
    ...options,
  });
  jsonSchemaTree.populate();
  return jsonSchemaTree.root;
}

export const findNodeWithPath = (node: SchemaNode, path: readonly string[]): SchemaNode | undefined => {
  if (node.path.length > path.length) {
    // too much circular recursion
    return undefined;
  }
  if (isEqual(node.path, path)) return node;

  if ((isRegularNode(node) || isRootNode(node)) && node.children) {
    for (const child of node.children) {
      const foundNode = findNodeWithPath(child, path);
      if (foundNode) return foundNode;
    }
  }

  // not found
  return undefined;
};

import { JSONSchema4 } from 'json-schema';
import { isRegularNode, isRootNode, SchemaNode, SchemaTree as JsonSchemaTree } from '@stoplight/json-schema-tree';
import { isEqual } from 'lodash/fp';

export function buildTree(schema: JSONSchema4) {
  const jsonSchemaTree = new JsonSchemaTree(schema, {
    mergeAllOf: true,
  });
  jsonSchemaTree.populate();
  return jsonSchemaTree.root;
}

export const findNodeWithPath = (node: SchemaNode, path: readonly string[]): SchemaNode | undefined => {
  console.log(node.path);
  debugger;
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

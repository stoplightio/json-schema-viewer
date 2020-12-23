import { isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';

export function isPropertyRequired(schemaNode: SchemaNode): boolean {
  const { parent } = schemaNode;
  if (parent === null || !isRegularNode(parent) || schemaNode.subpath.length === 0) {
    return false;
  }

  return !!parent.required?.includes(schemaNode.subpath[schemaNode.subpath.length - 1]);
}

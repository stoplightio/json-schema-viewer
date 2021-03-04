import { isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';

export const isParentNode = (node: SchemaNode) => isRegularNode(node) && (node.children?.length ?? 0) > 0;

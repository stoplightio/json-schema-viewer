import { TreeListNode } from '@stoplight/tree-list';
import { SchemaTreeListNode } from '../types';
import { SchemaNode } from './walker/nodes/types';

export const metadataStore = new WeakMap<SchemaTreeListNode, SchemaNode>();

export function getNodeMetadata(node: SchemaTreeListNode): SchemaNode {
  const metadata = metadataStore.get(node);
  if (metadata === void 0) {
    throw new Error('Missing metadata');
  }

  return metadata;
}

export function getLinkedNode(node: TreeListNode): SchemaNode {
  return getNodeMetadata(node);
}

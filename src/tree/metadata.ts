import { TreeListNode } from '@stoplight/tree-list';
import { SchemaTreeListNode } from '../types';
import { SchemaNode } from './walker/nodes/types';
import { SchemaFragment } from './walker/types';

export interface ITreeNodeMetaSchema {
  node: SchemaNode;
  fragment: SchemaFragment;
}

export type TreeNodeMeta = ITreeNodeMetaSchema;

export const metadataStore = new WeakMap<SchemaTreeListNode, TreeNodeMeta>();

export const getNodeMetadata = (node: TreeListNode): TreeNodeMeta => {
  const metadata = metadataStore.get(node);
  if (metadata === void 0) {
    throw new Error('Missing metadata');
  }

  return metadata;
};

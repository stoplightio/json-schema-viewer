import { JsonPath } from '@stoplight/types';
import { SchemaNode, SchemaTreeListNode } from '../types';
import { TreeListNode } from '@stoplight/tree-list';

export interface ITreeNodeMeta {
  path: JsonPath;
  schema: SchemaNode;
}

export const metadataStore = new WeakMap<SchemaTreeListNode, ITreeNodeMeta>();

export const getNodeMetadata = (node: TreeListNode): ITreeNodeMeta => {
  const metadata = metadataStore.get(node);
  if (metadata === void 0) {
    throw new Error('Missing metadata');
  }

  return metadata;
}

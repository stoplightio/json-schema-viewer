import { TreeListNode } from '@stoplight/tree-list';
import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { SchemaNode, SchemaTreeListNode } from '../types';

export interface ITreeNodeMeta {
  path: JsonPath;
  schemaNode: SchemaNode;
  schema: JSONSchema4;
}

export const metadataStore = new WeakMap<SchemaTreeListNode, ITreeNodeMeta>();

export const getNodeMetadata = (node: TreeListNode): ITreeNodeMeta => {
  const metadata = metadataStore.get(node);
  if (metadata === void 0) {
    throw new Error('Missing metadata');
  }

  return metadata;
};

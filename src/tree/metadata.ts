import { TreeListNode } from '@stoplight/tree-list';
import { JsonPath } from '@stoplight/types';
import { JSONSchema, SchemaNode, SchemaTreeListNode } from '../types';

export interface ITreeNodeMetaSchema {
  path: JsonPath;
  schemaNode: SchemaNode;
  schema: JSONSchema;
}

export interface ITreeNodeMetaError {
  path: JsonPath;
  error: string;
}

export type TreeNodeMeta = ITreeNodeMetaSchema | ITreeNodeMetaError;

export const metadataStore = new WeakMap<SchemaTreeListNode, TreeNodeMeta>();

export const getNodeMetadata = (node: TreeListNode): TreeNodeMeta => {
  const metadata = metadataStore.get(node);
  if (metadata === void 0) {
    throw new Error('Missing metadata');
  }

  return metadata;
};

export const getSchemaNodeMetadata = (node: TreeListNode): ITreeNodeMetaSchema => {
  const metadata = getNodeMetadata(node);

  if (!('schema' in metadata)) {
    throw new TypeError('Schema node expected');
  }

  return metadata;
};

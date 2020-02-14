import { JsonPath } from '@stoplight/types';
import { SchemaNode, SchemaTreeListNode } from '../types';

export interface ITreeNodeMeta {
  path: JsonPath;
  schema: SchemaNode;
}

export const metadataStore = new WeakMap<SchemaTreeListNode, ITreeNodeMeta>();

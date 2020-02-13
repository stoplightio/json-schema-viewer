import { Dictionary, JsonPath } from '@stoplight/types';
import { SchemaNode } from '../types';

export interface ITreeNodeMeta {
  path: JsonPath;
  schema: SchemaNode;
}

export const MetadataStore: Dictionary<ITreeNodeMeta, string> = {};

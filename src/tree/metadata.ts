import { Dictionary, JsonPath } from '@stoplight/types';
import { SchemaNode } from '../types';

export interface ITreeNodeMeta {
  path: JsonPath;
  schema: SchemaNode;
}

export const MetadataStore: Dictionary<ITreeNodeMeta, string> = {}; // todo: can be a weakmap I guess since no stringyfing is needed

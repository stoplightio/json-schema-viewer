import type {
  ReferenceNode,
  RegularNode,
  SchemaNodeKind,
  SchemaTreeRefDereferenceFn,
} from '@stoplight/json-schema-tree';
import type { Optional } from '@stoplight/types';

import type { ViewMode } from '../types';

export type SchemaTreeRefInfo = {
  source: string | null;
  pointer: string | null;
};

export type SchemaTreeOptions = {
  expandedDepth: number;
  mergeAllOf: boolean;
  resolveRef: Optional<SchemaTreeRefDereferenceFn>;
  viewMode?: ViewMode;
};

export type ArrayNode = RegularNode & {
  primaryType: SchemaNodeKind.Array;
};

export type PrimitiveArrayNode = ArrayNode & {
  children: [RegularNode & { simple: true }];
};

export type ComplexArrayNode = ArrayNode & {
  children: [RegularNode & { simple: false }];
};

export type BrokenRefArrayNode = ArrayNode & {
  children: [ReferenceNode & { error: string }];
};

export type FlattenableNode = PrimitiveArrayNode | ComplexArrayNode | BrokenRefArrayNode;

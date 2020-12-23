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

export type FlattenableNode = RegularNode & {
  primaryType: SchemaNodeKind.Array;
  children:
    | ((RegularNode & { simple: true })[] & { 0: RegularNode & { simple: true } })
    | [RegularNode & { simple: false }]
    | [ReferenceNode & { error: string }];
};

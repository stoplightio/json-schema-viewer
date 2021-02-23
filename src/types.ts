import { ReferenceNode, SchemaNode } from '@stoplight/json-schema-tree';
import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import * as React from 'react';
import { ITreeListNodeWithChildren } from '@stoplight/tree-list/types';

type Metadata = { schemaNode: SchemaNode; typeOptions?: ReadonlyArray<SchemaNode> };
export type SchemaTreeListNode = TreeListNode<Metadata>;
export type SchemaTreeListNodeWithChildren = ITreeListNodeWithChildren<Metadata, SchemaTreeListNode>;

export type GoToRefHandler = (node: ReferenceNode) => void;

export type RowRenderer = (
  node: SchemaTreeListNode,
  rowOptions: IRowRendererOptions,
  treeStore: TreeStore,
) => React.ReactNode;

export type ViewMode = 'read' | 'write' | 'standalone';

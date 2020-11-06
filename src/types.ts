import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import * as React from 'react';
import { SchemaReferenceNode } from './tree/walker/nodes/ReferenceNode';

export type SchemaTreeListNode = TreeListNode;

export type GoToRefHandler = (path: string, node: SchemaReferenceNode) => void;

export type RowRenderer = (
  node: TreeListNode,
  rowOptions: IRowRendererOptions,
  treeStore: TreeStore,
) => React.ReactNode;

export type ViewMode = 'read' | 'write' | 'standalone';

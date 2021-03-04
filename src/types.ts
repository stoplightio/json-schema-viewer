import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import * as React from 'react';

export type SchemaTreeListNode = TreeListNode;

export type RowRenderer = (
  node: TreeListNode,
  rowOptions: IRowRendererOptions,
  treeStore: TreeStore,
) => React.ReactNode;

export type ViewMode = 'read' | 'write' | 'standalone';

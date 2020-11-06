import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import * as React from 'react';
import { ReferenceNode } from './tree/walker/nodes/ReferenceNode';

export type SchemaTreeListNode = TreeListNode;

export type GoToRefHandler = (schemaNode: ReferenceNode) => void;

export type RowRenderer = (
  node: TreeListNode,
  rowOptions: IRowRendererOptions,
  treeStore: TreeStore,
) => React.ReactNode;

export type ViewMode = 'read' | 'write' | 'standalone';

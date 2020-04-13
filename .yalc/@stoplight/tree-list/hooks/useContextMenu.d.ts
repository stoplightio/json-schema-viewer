import * as React from 'react';
import { TreeListContextMenuGenerator, TreeListNode } from '../types';
export declare const useContextMenu: (node: TreeListNode<unknown>, generateContextMenu?: TreeListContextMenuGenerator | undefined) => (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;

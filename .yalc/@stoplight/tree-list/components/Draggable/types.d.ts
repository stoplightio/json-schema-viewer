import { HTMLAttributes } from 'react';
import { ITreeListItemData, TreeListNode } from '../../types';
export interface IDraggableItem extends HTMLAttributes<HTMLDivElement>, ITreeListItemData {
    node: TreeListNode;
    contextMenuId?: string;
}
export interface IDraggableContainer extends HTMLAttributes<HTMLDivElement> {
}

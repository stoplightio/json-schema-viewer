import * as React from 'react';
import { ITreeListEditableItem } from '../components/TreeListEditableItem';
import { IRowRendererOptions, TreeListNode } from '../types';
export interface ITreeListRow extends IRowRendererOptions, Pick<ITreeListEditableItem, 'placeholder'> {
    className?: string;
    node: TreeListNode;
}
export declare const TreeListRow: React.FunctionComponent<ITreeListRow>;

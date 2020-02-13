import { ITreeListEditableItem } from 'src/components/TreeListEditableItem';
import { IRowRendererOptions, TreeListNode } from 'src/types';
export interface ITreeListRow extends IRowRendererOptions, Pick<ITreeListEditableItem, 'placeholder'> {
    className?: string;
    node: TreeListNode;
}
export declare const TreeListRow: any;

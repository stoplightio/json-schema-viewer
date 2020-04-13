import { IDisposable, IEventEmitter } from '@stoplight/lifecycle';
import { Dictionary } from '@stoplight/types';
import { IFixedSizeList, IVariableSizeList } from '@stoplight/ui-kit/ScrollList';
import * as React from 'react';
import { FixedSizeListProps, VariableSizeListProps } from 'react-window';
import { Tree } from './tree';
import { TreeState } from './tree/state';
import { IconStore, ITreeListEvents, ITreeListNode, NodeExpandFilter, NodeValidator, TreeListNode, TreeListParentNode } from './types';
export declare class TreeStore<T extends Tree = Tree> implements IDisposable {
    readonly state: TreeState;
    readonly tree: T;
    icons: IconStore;
    defaultExpandedDepth: number;
    private _innerPadding;
    get innerPadding(): number | null;
    set innerPadding(value: number | null);
    instanceRef: React.RefObject<IFixedSizeList | IVariableSizeList>;
    readonly events: IEventEmitter<ITreeListEvents>;
    readonly placeholderId: string;
    constructor(tree: T, state: TreeState, initialStore?: Partial<Pick<TreeStore, 'icons' | 'defaultExpandedDepth'>>);
    dispose(): void;
    readonly setActiveNode: (id: string | null) => void;
    protected readonly setEditedNode: (id: string | null) => void;
    scrollToItem: (node: TreeListNode<unknown>) => undefined;
    protected static isFixedSizeList(props: FixedSizeListProps | VariableSizeListProps): props is FixedSizeListProps;
    protected static getOffsetForIndexAndAlignment({ direction, height, itemCount, itemSize, layout, width }: FixedSizeListProps, index: number, scrollOffset: number, padding: number | null): number;
    toggleExpand(node: TreeListParentNode, flag?: boolean): void;
    expandAll(filter?: NodeExpandFilter): void;
    collapseAll(filter?: NodeExpandFilter): void;
    static isNodeExpanded(node: TreeListParentNode, expanded: Dictionary<boolean>, defaultExpandedDepth: number): boolean;
    isNodeExpanded(node: TreeListParentNode): boolean;
    isAllExpanded(): boolean;
    isAllCollapsed(): boolean;
    create(newNode: Partial<Omit<ITreeListNode, 'id'>> & {
        id: string;
    }, parentNode: TreeListParentNode, validator?: NodeValidator): Promise<TreeListNode>;
    readonly rename: (node: TreeListNode<unknown>, validator?: NodeValidator | undefined) => Promise<TreeListNode<unknown>>;
}

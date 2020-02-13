import { IDisposable, IEventEmitter } from '@stoplight/lifecycle';
import { Dictionary } from '@stoplight/types';
import { IFixedSizeList, IVariableSizeList } from '@stoplight/ui-kit/ScrollList';
import * as React from 'react';
import { Tree } from './tree';
import { TreeState } from './tree/state';
import { IconStore, ITreeListEvents, ITreeListNode, NodeExpandFilter, NodeValidator, TreeListNode, TreeListParentNode } from './types';
export declare class TreeStore implements IDisposable {
    readonly state: TreeState;
    readonly tree: Tree;
    icons: IconStore;
    defaultExpandedDepth: number;
    instanceRef: React.RefObject<IFixedSizeList | IVariableSizeList>;
    readonly events: IEventEmitter<ITreeListEvents>;
    readonly placeholderId: string;
    constructor(tree: Tree, state: TreeState, initialStore?: Partial<Pick<TreeStore, 'icons' | 'defaultExpandedDepth'>>);
    dispose(): void;
    readonly setActiveNode: (id: string | null) => void;
    protected readonly setEditedNode: (id: string | null) => void;
    scrollToItem: (node: TreeListNode) => void;
    toggleExpand(node: TreeListParentNode, flag?: boolean): void;
    expandAll(filter?: NodeExpandFilter): void;
    collapseAll(filter?: NodeExpandFilter): void;
    static isNodeExpanded(node: TreeListParentNode, expanded: Dictionary<boolean>, defaultExpandedDepth: number): boolean;
    isNodeExpanded(node: TreeListParentNode): boolean;
    isAllExpanded(): boolean;
    isAllCollapsed(): boolean;
    create(newNode: Partial<Omit<ITreeListNode, 'id'>> & {
        id: string;
    }, parentNodeId: string | null, validator?: NodeValidator): Promise<TreeListNode>;
    readonly rename: (nodeId: string, validator?: NodeValidator | undefined) => Promise<TreeListNode>;
}

import { TreeListNode, TreeListParentNode } from '../types';
import { Tree } from './tree';
export declare abstract class AsyncTree extends Tree {
    protected abstract load(node: TreeListParentNode): Promise<TreeListNode>;
    protected readonly visited: WeakSet<import("../types").ITreeListNodeWithChildren>;
    unwrap(node: TreeListParentNode): Promise<void>;
}

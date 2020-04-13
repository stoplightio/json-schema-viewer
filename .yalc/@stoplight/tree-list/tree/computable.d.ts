import { TreeFragment, TreeListNode, TreeListParentNode } from '../types';
import { ITreeIterationOptions, Tree } from './tree';
export declare type ComputeRowsFn = (node: TreeListParentNode) => TreeFragment;
export declare class ComputableTree extends Tree {
    protected readonly computeRows: ComputeRowsFn;
    private readonly visited;
    constructor(computeRows: ComputeRowsFn, iterationOptions?: ITreeIterationOptions | null, root?: TreeListParentNode, cacheSize?: number);
    private static mapById;
    compute(node: TreeListParentNode, ignore?: string[]): void;
    protected processTreeFragment(node: TreeListParentNode): number;
    unwrap(node: TreeListParentNode): void;
    insertTreeFragment(fragment: TreeFragment, parent: TreeListParentNode): void;
    insertNode(node: TreeListNode, parent: TreeListParentNode): void;
    invalidate(): void;
}

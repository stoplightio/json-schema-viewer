import { TreeFragment, TreeListParentNode } from '../types';
import { ITreeIterationOptions, Tree } from './tree';
export declare type ComputeRowsFn = (node: TreeListParentNode) => TreeFragment | Promise<TreeFragment>;
export declare class ComputableTree extends Tree {
    protected readonly computeRows: ComputeRowsFn;
    private visited;
    constructor(computeRows: ComputeRowsFn, iterationOptions?: ITreeIterationOptions | null, root?: TreeListParentNode, cacheSize?: number);
    private computeTree;
    unwrap(node: TreeListParentNode): Promise<void>;
    invalidate(): void;
}

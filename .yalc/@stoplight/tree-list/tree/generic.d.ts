import { ITreeIterationOptions, Tree } from '../tree/tree';
import { ITreeListNode, ITreeListNodeWithChildren, TreeListNode } from '../types';
declare type TreeLikeNode<N extends TreeLikeNode<N>> = {
    id: string;
    parent: TreeLikeNodeWithChildren<N> | undefined | null;
};
declare type TreeLikeNodeWithChildren<N extends TreeLikeNode<N>> = {
    id: string;
    parent: TreeLikeNodeWithChildren<N> | undefined | null;
    children: N[];
};
declare type TransformedTreeNode<N extends TreeLikeNode<N>> = Omit<ITreeListNode | (Omit<ITreeListNodeWithChildren, 'children'> & {
    children: N[];
}), 'parent'> & {
    parent: DeepTransformedTreeNode<N> | null;
};
declare type TransformedTreeParentNode<N extends TreeLikeNode<N>> = Omit<ITreeListNodeWithChildren, 'children' | 'parent'> & {
    children: N[];
    parent: DeepTransformedTreeNode<N> | null;
};
declare type DeepTransformedTreeNode<N extends TreeLikeNode<N>> = Omit<ITreeListNodeWithChildren, 'children' | 'parent'> & {
    children: Array<TransformedTreeNode<N>>;
    parent: DeepTransformedTreeNode<N> | null;
};
declare type Transform<N extends TreeLikeNode<N>> = (n: N) => Omit<TransformedTreeNode<N>, 'parent'> & {
    parent: N;
};
export declare class GenericTree<N extends TreeLikeNode<N> | TreeLikeNodeWithChildren<N>> extends Tree {
    protected readonly transformNode: Transform<N>;
    protected readonly transformedNodes: WeakMap<TreeLikeNodeWithChildren<N>, TransformedTreeNode<N>>;
    constructor(root: TreeLikeNodeWithChildren<N>, transformNode: Transform<N>, iterationOptions?: ITreeIterationOptions | null);
    protected transform(node: N, parent: DeepTransformedTreeNode<N> | null): Pick<TransformedTreeNode<N>, "id" | "name" | "type" | "metadata"> & {
        parent: N;
    };
    protected transformChildren(transformedNode: TransformedTreeParentNode<N>): void;
    protected decorateNode(node: N | TreeListNode): void;
}
export {};

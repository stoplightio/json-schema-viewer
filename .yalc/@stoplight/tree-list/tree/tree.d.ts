import { Optional } from '@stoplight/types';
import { DeprecatedTreeListNode, TreeFragment, TreeListNode, TreeListParentNode } from '../types';
import { IndexLookup } from './cache';
declare type Arrayish = Pick<typeof Array['prototype'], 'indexOf' | 'every'>;
declare type Range = {
    offset: number;
    length: number;
};
export interface ITreeIterationOptions {
    readonly order?: ((nodeA: TreeListNode, nodeB: TreeListNode) => number) | null;
    readonly filter?: ((node: TreeListNode, i: number, nodes: TreeListNode[]) => boolean) | null;
    readonly expanded?: ((node: TreeListParentNode) => boolean) | null;
}
export declare class Tree implements Arrayish {
    protected readonly iterationOptions: ITreeIterationOptions | null;
    protected _root: TreeListParentNode;
    get root(): TreeListParentNode<unknown>;
    protected readonly indexLookup: IndexLookup<TreeListNode>;
    protected readonly unwrapped: WeakSet<TreeListParentNode<unknown>> & {
        swap(): void;
    };
    protected readonly sorted: WeakSet<TreeListParentNode<unknown>> & {
        swap(): void;
    };
    protected readonly filtered: WeakMap<TreeListParentNode<unknown>, TreeListNode<unknown>[]> & {
        swap(): void;
    };
    private _versionCounter;
    get versionCounter(): number;
    set versionCounter(val: number);
    private _count;
    get count(): number;
    set count(val: number);
    constructor(iterationOptions?: ITreeIterationOptions | null, tree?: TreeListParentNode, cacheSize?: number);
    setRoot(tree: TreeListParentNode): void;
    static getLevel(node: TreeListNode): any;
    static getDropZoneId(node: TreeListNode): any;
    clearCache(): void;
    protected getFilteredChildren(node: TreeListParentNode): TreeListNode[] | ReadonlyArray<never>;
    protected getChildren(node: TreeListParentNode): TreeListNode[] | ReadonlyArray<never>;
    protected static level: PropertyDescriptor;
    protected static dropZoneId: PropertyDescriptor;
    private static _toTree;
    static createArtificialRoot(): TreeListParentNode;
    static toTree(nodes: DeprecatedTreeListNode[]): TreeListParentNode;
    [Symbol.iterator](): IterableIterator<TreeListNode>;
    getIteratorForNode(node: TreeListParentNode): Generator<TreeListNode>;
    static getOffsetForNode(_node: TreeListNode): number;
    protected _itemAt(node: TreeListParentNode, pos: number, boundaries: Range): Optional<TreeListNode>;
    protected static readonly boundaries: Range;
    protected getLastItem(node: TreeListNode): Optional<TreeListNode>;
    private _nextItem;
    nextItem(node: TreeListNode): Optional<TreeListNode>;
    prevItem(node: TreeListNode): Optional<TreeListNode>;
    itemAt(pos: number): import("../types").ITreeListNode<unknown> | undefined;
    indexOf(target: TreeListNode): number;
    every(callbackfn: (value: TreeListNode, index: number, array: []) => unknown, thisArg?: any): boolean;
    findById(id: string): Optional<TreeListNode>;
    invalidate(): void;
    forceUpdate(): void;
    protected invalidateCounter(node: TreeListParentNode, deep: boolean): void;
    protected invalidateLevel(node: TreeListNode): void;
    invalidateNode(node: TreeListNode): void;
    invalidateOrder(): void;
    wrap(node: TreeListParentNode): void;
    unwrap(node: TreeListParentNode): void;
    moveNode(node: TreeListNode, parent: TreeListParentNode): void;
    protected prepareNode(node: TreeListNode, parent: TreeListParentNode): void;
    insertNode(node: TreeListNode, parent: TreeListParentNode): void;
    insertTreeFragment(fragment: TreeFragment, parent: TreeListParentNode): void;
    removeNode(node: TreeListNode): void;
    replaceNode(node: TreeListNode, newNode: TreeListNode): void;
    protected getCount(node: TreeListParentNode): any;
    protected setCount(node: TreeListParentNode, count: number): void;
    protected resetCounter(node: TreeListParentNode): void;
    protected processTreeFragment(node: TreeListParentNode): number;
    protected static resetLevel(node: TreeListNode): void;
    protected static resetDropZoneId(node: TreeListNode): void;
    protected decorateNode(node: TreeListNode): void;
    static isDecoratedNode(node: unknown): node is TreeListNode;
    static transformDeprecatedNode(node: DeprecatedTreeListNode, parentNode: TreeListParentNode | null): TreeListNode;
}
export {};

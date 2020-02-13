import { Optional } from '@stoplight/types';
import { DeprecatedTreeListNode, TreeListNode, TreeListParentNode } from 'src/types';
export declare function assertNode(node: Optional<TreeListNode>): asserts node is TreeListNode;
export declare function assertParentNode(node: Optional<TreeListNode | null>): asserts node is TreeListParentNode;
export declare const isDeprecatedTreeListNode: (node: unknown) => node is DeprecatedTreeListNode<T>;

import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';

export const addChildrenToTreeListNode = (treeListNode: TreeListNode): TreeListParentNode => {
    const treeListParentNode = treeListNode as TreeListParentNode;
    if (!treeListParentNode.children) {
        treeListParentNode.children = [];
    }
    return treeListParentNode;
}
import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';

import { metadataStore } from '../metadata';
import { SchemaNode, SchemaTreeListNode } from '../walker/nodes/types';
import { SchemaFragment } from '../walker/types';
import { Walker } from '../walker/walk';

export type PopulateOptions = {
  onNode?(fragment: SchemaFragment, node: SchemaNode, parentTreeNode: TreeListNode, level: number): boolean | void;
};

export function populateTree(
  fragment: SchemaFragment,
  parent: TreeListParentNode,
  level: number,
  walker: Walker,
  options: PopulateOptions,
): void {
  for (const { node, fragment: currentFragment } of walker.enter(fragment)) {
    if (options !== null && options.onNode !== void 0 && !options.onNode(currentFragment, node, parent, level)) {
      continue;
    }

    const treeNode: SchemaTreeListNode = {
      id: node.id,
      name: '',
      parent,
    };

    parent.children.push(treeNode);
    metadataStore.set(treeNode, {
      node,
      fragment: currentFragment,
    });

    if ('queryChildren' in node) {
      for (const child of node.queryChildren()) {
        if (!('children' in treeNode)) {
          (treeNode as TreeListParentNode).children = [];
        }

        const { length } = node.path;
        node.path.push(...child.relativePath);
        populateTree(child.value, treeNode as TreeListParentNode, level + 1, walker, options);
        node.path.length = length;
      }
    }
  }
}

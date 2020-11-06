import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import { SchemaTreeListNode } from '../../../types';
import { SchemaNode } from '../../nodes/types';
import { SchemaFragment } from '../../types';

import { walk } from '../../walk';
import { metadataStore } from '../metadata';

export type WalkerRefResolver = (path: string[] | null, $ref: string) => JSONSchema4;

export type WalkingOptions = {
  onNode?(fragment: JSONSchema4, node: SchemaNode, parentTreeNode: TreeListNode, level: number): boolean | void;
};

export type Walker = (
  schema: SchemaFragment,
  parent: TreeListParentNode,
  level: number,
  path: string[],
  options: WalkingOptions,
) => void;

export const populateTree: Walker = (fragment, parent, level, path, options): void => {
  for (const { node, fragment: currentFragment } of walk(fragment)) {
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
      path,
    });

    if ('queryChildren' in node) {
      for (const child of node.queryChildren()) {
        if (!('children' in treeNode)) {
          (treeNode as TreeListParentNode).children = [];
        }

        const { length } = path;
        path.push(...child.relativePath);
        populateTree(child.value, treeNode as TreeListParentNode, level + 1, path, options);
        path.length = length;
      }
    }
  }
}

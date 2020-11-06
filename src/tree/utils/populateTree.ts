import { isParentNode, TreeListParentNode } from '@stoplight/tree-list';
import { SchemaTreeListNode } from '../../types';
import { metadataStore } from '../metadata';
import { SchemaNode } from '../walker/nodes/types';
import { SchemaFragment } from '../walker/types';
import { Walker } from '../walker/walk';

const map = new WeakMap<SchemaNode, SchemaTreeListNode>();

export function populateTree(fragment: SchemaFragment, parentFragment: SchemaFragment | null, walker: Walker): void {
  for (const { node: schemaNode, parentNode: parentSchemaNode } of walker.walk(fragment, parentFragment)) {

    const parent = parentSchemaNode === null ? null : map.get(parentSchemaNode) || null;

    const treeNode: SchemaTreeListNode = {
      id: schemaNode.id,
      name: '',
      parent: parent as TreeListParentNode | null,
    };

    metadataStore.set(treeNode, schemaNode);

    if (parent === null) continue;
    if (!isParentNode(parent)) {
      (parent as TreeListParentNode).children = [treeNode];
    } else {
      parent.children.push(treeNode);
    }
  }
}

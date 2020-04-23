import { TreeListParentNode } from '@stoplight/tree-list';
import { SchemaTreeListNode } from '../../types';
import { generateId } from '../../utils/generateId';
import { getSchemaNodeMetadata, metadataStore } from '../metadata';

export function createErrorTreeNode(parent: TreeListParentNode, error: string) {
  const { path } = getSchemaNodeMetadata(parent);

  const errorNode: SchemaTreeListNode = {
    id: generateId(),
    name: '',
    parent,
  };

  metadataStore.set(errorNode, {
    path,
    error,
  });

  return errorNode;
}

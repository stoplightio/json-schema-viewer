import { isReferenceNode, isRegularNode, RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { isParentNode } from '@stoplight/tree-list';

import { isNonNullable } from '../guards/isNonNullable';
import type { SchemaTreeListTree } from '../tree';
import type { SchemaTreeListNode } from '../types';

export function printName(
  tree: SchemaTreeListTree,
  treeNode: SchemaTreeListNode,
  schemaNode: RegularNode,
): string | null {
  if (
    schemaNode.primaryType !== SchemaNodeKind.Array ||
    !isNonNullable(schemaNode.children) ||
    schemaNode.children.length === 0
  ) {
    return schemaNode.title;
  }

  return printArrayName(tree, schemaNode, treeNode);
}

function printArrayName(
  tree: SchemaTreeListTree,
  schemaNode: RegularNode,
  treeNode: SchemaTreeListNode,
): string | null {
  if (!isNonNullable(schemaNode.children) || schemaNode.children.length === 0) {
    return schemaNode.title;
  }

  if (schemaNode.children.length === 1 && isReferenceNode(schemaNode.children[0])) {
    return `$ref(${schemaNode.children[0].value})[]`;
  }

  if (!isParentNode(treeNode)) {
    const val =
      schemaNode.children?.reduce<SchemaNodeKind[] | null>((mergedTypes, child) => {
        if (mergedTypes === null) return null;

        if (!isRegularNode(child)) return null;

        if (child.types !== null && child.types.length > 0) {
          for (const type of child.types) {
            if (mergedTypes.includes(type)) continue;
            mergedTypes.push(type);
          }
        }

        return mergedTypes;
      }, []) ?? null;

    return val !== null && val.length > 0 ? `${SchemaNodeKind.Array}[${val.join(',')}]` : null;
  }

  if (tree.isFlattenedNode(schemaNode) && isRegularNode(schemaNode.children[0])) {
    const firstChild = schemaNode.children[0];
    return firstChild.title !== null
      ? `${firstChild.title}[]`
      : `${SchemaNodeKind.Array}[${firstChild.primaryType ?? firstChild.combiners?.join(',')}]`;
  }

  return null;
}

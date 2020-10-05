import { pathToPointer } from '@stoplight/json';
import * as treeify from 'treeify';

import { TreeListNode } from '@stoplight/tree-list';
import { JSONSchema4CombinerName } from '../../../types';
import { hasRefItems, isArrayNodeWithItems } from '../../../utils/guards';
import { inferType } from '../../../utils/inferType';
import { getNodeMetadata } from '../../metadata';
import { SchemaTree } from '../../tree';

export function printTree(tree: SchemaTree) {
  const root: unknown =
    tree.root.children.length > 1 ? tree.root.children.map(prepareTree) : prepareTree(tree.root.children[0]);

  return treeify.asTree(root as treeify.TreeObject, true, true);
}

type PrintableNode = {
  [key in string]: {
    type?: unknown;
    combiner?: JSONSchema4CombinerName;
    subtype?: unknown;
    $ref?: unknown;
    children?: PrintableNode[];
  };
};

function prepareTree(node: TreeListNode): PrintableNode {
  const metadata = getNodeMetadata(node);
  const schema = 'schemaNode' in metadata ? metadata.schemaNode : null;
  const type = schema && 'type' in schema ? schema.type : null;
  // taken from Property component
  const subtype =
    schema && isArrayNodeWithItems(schema)
      ? hasRefItems(schema)
        ? `$ref[${schema.items.$ref}]`
        : inferType(schema.items)
      : null;

  return {
    [pathToPointer(metadata.path)]: {
      ...(type && { type }),
      ...(subtype && { subtype }),
      ...(schema && {
        ...('$ref' in schema && { $ref: schema.$ref }),
        ...('combiner' in schema && { combiner: schema.combiner }),
      }),
      ...('children' in node && { children: node.children.map(prepareTree) }),
    },
  };
}

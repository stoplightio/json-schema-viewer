import { pathToPointer } from '@stoplight/json';
import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';
import { Optional } from '@stoplight/types';
import { JSONSchema4TypeName } from 'json-schema';
import { getPrimaryType } from '../../../utils/getPrimaryType';
import { getNodeMetadata } from '../../metadata';
import { SchemaTree } from '../../tree';

const treeify = require('treeify');

export function printTree(tree: SchemaTree) {
  return treeify.asTree(prepareTree(tree.root.children[0]), true);
}

type PrintableNode = {
  [key in string]: {
    type: Optional<JSONSchema4TypeName | JSONSchema4TypeName[] | null>;
    children?: PrintableNode[];
  };
};

function prepareTree(node: TreeListNode): PrintableNode {
  const metadata = getNodeMetadata(node);
  const type = 'schema' in metadata ? getPrimaryType(metadata.schema) : null;

  if (SchemaTree.getLevel(node) === 0) {
    return {
      '#': {
        type,
        children: (node as TreeListParentNode).children.map(prepareTree),
      },
    };
  }

  return {
    [pathToPointer(metadata.path)]: {
      type,
      ...('children' in node && { children: node.children.map(prepareTree) }),
    },
  };
}

import { pathToPointer } from '@stoplight/json';
import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';
import { Optional } from '@stoplight/types';
import { JSONSchema4TypeName } from 'json-schema';
import { getPrimaryType } from '../../../utils/getPrimaryType';
import { getNodeMetadata } from '../../metadata';
import { SchemaTree } from '../../tree';
import { JSONSchema4CombinerName } from '../../../types';
import { getCombiner } from '../../../utils/getCombiner';

const treeify = require('treeify');

export function printTree(tree: SchemaTree) {
  return treeify.asTree(prepareTree(tree.root.children[0]), true);
}

type PrintableNode = {
  [key in string]: {
    type?: Optional<JSONSchema4TypeName | JSONSchema4TypeName[] | null>;
    combiner?: JSONSchema4CombinerName;
    $ref?: unknown;
    children?: PrintableNode[];
  };
};

function prepareTree(node: TreeListNode): PrintableNode {
  const metadata = getNodeMetadata(node);
  const schema = 'schema' in metadata ? metadata.schema : null;
  const combiner = schema ? getCombiner(schema) : null;
  const type = schema ? getPrimaryType(schema) : null;

  if (SchemaTree.getLevel(node) === 0) {
    return {
      '#': {
        ...(type && { type }),
        ...(combiner && { combiner }),
        ...(schema && '$ref' in schema && { $ref: schema.$ref }),
        children: (node as TreeListParentNode).children.map(prepareTree),
      },
    };
  }

  return {
    [pathToPointer(metadata.path)]: {
      ...(type && { type }),
      ...(combiner && { combiner }),
      ...(schema && '$ref' in schema && { $ref: schema.$ref }),
      ...('children' in node && { children: node.children.map(prepareTree) }),
    },
  };
}

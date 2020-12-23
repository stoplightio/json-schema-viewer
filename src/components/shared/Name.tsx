import { RegularNode, SchemaCombinerName, SchemaNodeKind } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { useSchemaNode, useSchemaTree, useTreeListNode } from '../../hooks';
import { printName } from '../../utils/printName';

export const Name: React.FC<{ type: SchemaNodeKind | SchemaCombinerName }> = ({ type }) => {
  const schemaNode = useSchemaNode() as RegularNode;
  const treeNode = useTreeListNode();
  const tree = useSchemaTree();

  return <>{printName(tree, treeNode, schemaNode) ?? type}</>;
};

import { RegularNode, SchemaCombinerName, SchemaNodeKind } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { useSchemaNode } from '../../hooks';
import { printName } from '../../utils';

export const Name: React.FC<{ type: SchemaNodeKind | SchemaCombinerName }> = ({ type }) => {
  const schemaNode = useSchemaNode() as RegularNode;

  return <>{printName(schemaNode) ?? type}</>;
};

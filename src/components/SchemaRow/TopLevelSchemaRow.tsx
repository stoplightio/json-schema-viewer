import { isRegularNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { ChildStack } from '../shared/ChildStack';
import { SchemaRow, SchemaRowProps } from './SchemaRow';

export const TopLevelSchemaRow: React.FC<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && schemaNode.primaryType === 'object' && schemaNode.types?.length === 1) {
    return (
      <ChildStack childNodes={schemaNode.children ?? []} currentNestingLevel={nestingLevel} shouldIndent={false} />
    );
  }

  return <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />;
};

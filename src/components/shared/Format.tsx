import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import cn from 'classnames';
import * as React from 'react';

import { PROPERTY_TYPE_COLORS } from '../../consts';
import { useSchemaNode } from '../../hooks/useSchemaNode';

function matchPropertyColor(node: RegularNode): string | null {
  if (node.types === null || node.types.length !== 1) return null;

  return PROPERTY_TYPE_COLORS[node.types[0]];
}

export const Format: React.FunctionComponent = () => {
  const schemaNode = useSchemaNode();

  if (!isRegularNode(schemaNode) || schemaNode.format === null) {
    return null;
  }

  return <span className={cn('ml-2', matchPropertyColor(schemaNode))}>{`<${schemaNode.format}>`}</span>;
};

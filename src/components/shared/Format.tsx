import { isRegularNode } from '@stoplight/json-schema-tree';
import { Text } from '@stoplight/mosaic';
import * as React from 'react';
import { useSchemaNode } from '../../hooks/useSchemaNode';

export const Format: React.FunctionComponent = () => {
  const schemaNode = useSchemaNode();

  if (!isRegularNode(schemaNode) || schemaNode.format === null) {
    return null;
  }

  return <Text ml={2} color="muted">{`<${schemaNode.format}>`}</Text>;
};

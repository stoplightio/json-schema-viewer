import { isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { Box } from '@stoplight/mosaic';
import * as React from 'react';

type FormatProps = {
  schemaNode: SchemaNode;
};

export const Format: React.FunctionComponent<FormatProps> = ({ schemaNode }) => {
  if (!isRegularNode(schemaNode) || schemaNode.format === null) {
    return null;
  }

  return <Box as="span" color="muted">{`<${schemaNode.format}>`}</Box>;
};

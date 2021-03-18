import { isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

type FormatProps = {
  schemaNode: SchemaNode;
};

export const Format: React.FunctionComponent<FormatProps> = ({ schemaNode }) => {
  if (!isRegularNode(schemaNode) || schemaNode.format === null) {
    return null;
  }

  return <span className="sl-ml-2 sl-text-muted">{`<${schemaNode.format}>`}</span>;
};

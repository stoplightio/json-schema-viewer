import { isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

type FormatProps = {
  schemaNode: SchemaNode;
};

export const Format = observer<FormatProps>(({ schemaNode }) => {
  if (!isRegularNode(schemaNode) || schemaNode.format === null) {
    return null;
  }

  return <span className="sl-text-muted">{`<${schemaNode.format}>`}</span>;
});

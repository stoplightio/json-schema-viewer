import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { calculateChildrenToShow, isComplexArray } from '../../tree';
import { ChildStack } from '../shared/ChildStack';
import { SchemaRow, SchemaRowProps } from './SchemaRow';

export const TopLevelSchemaRow: React.FC<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const childNodes = React.useMemo(() => calculateChildrenToShow(schemaNode), [schemaNode]);

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />;
  }

  if (isComplexArray(schemaNode) && isPureObjectNode(schemaNode.children[0])) {
    return (
      <div className="sl-text-sm sl-relative">
        <div className="sl-mr-2 sl-font-mono sl-font-bold">array of:</div>
        {childNodes.length > 0 ? <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} /> : null}
      </div>
    );
  }

  return <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />;
};

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1;
}

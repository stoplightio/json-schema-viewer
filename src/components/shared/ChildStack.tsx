import { SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { SchemaRow } from '../SchemaRow';

type ChildStackProps = {
  childNodes: readonly SchemaNode[];
  currentNestingLevel: number;
  className?: string;
};
export const ChildStack = ({ childNodes, currentNestingLevel, className }: ChildStackProps) => (
  <div className={className}>
    {childNodes.map((childNode: SchemaNode, index) => (
      <React.Fragment key={childNode.id}>
        {index > 0 && <div className="sl-border-t sl-border-light sl-self-stretch" />}
        <SchemaRow schemaNode={childNode} nestingLevel={currentNestingLevel + 1} />
      </React.Fragment>
    ))}
  </div>
);

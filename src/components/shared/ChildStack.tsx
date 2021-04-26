import type { SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { NESTING_OFFSET } from '../../consts';
import { SchemaRow, SchemaRowProps } from '../SchemaRow';

const childStackStyle = { paddingLeft: NESTING_OFFSET };

type ChildStackProps = {
  childNodes: readonly SchemaNode[];
  currentNestingLevel: number;
  className?: string;
  RowComponent?: React.FC<SchemaRowProps>;
};
export const ChildStack = ({
  childNodes,
  currentNestingLevel,
  className,
  RowComponent = SchemaRow,
}: ChildStackProps) => (
  <div className={className} style={childStackStyle}>
    {childNodes.map((childNode: SchemaNode, index) => (
      <React.Fragment key={childNode.id}>
        {index > 0 && <div className="sl-border-t sl-border-light sl-self-stretch" />}
        <RowComponent schemaNode={childNode} nestingLevel={currentNestingLevel + 1} />
      </React.Fragment>
    ))}
  </div>
);

import { SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { NESTING_OFFSET } from '../../consts';
import { SchemaRow, SchemaRowProps } from '../SchemaRow';

type ChildStackProps = {
  childNodes: readonly SchemaNode[];
  currentNestingLevel: number;
  className?: string;
  shouldIndent?: boolean;
  RowComponent?: React.FC<SchemaRowProps>;
};
export const ChildStack = ({
  childNodes,
  currentNestingLevel,
  className,
  shouldIndent = true,
  RowComponent = SchemaRow,
}: ChildStackProps) => (
  <div className={className} style={shouldIndent ? { marginLeft: NESTING_OFFSET } : undefined}>
    {childNodes.map((childNode: SchemaNode, index) => (
      <React.Fragment key={childNode.id}>
        {index > 0 && <div className="sl-border-t sl-border-light sl-self-stretch" />}
        <RowComponent schemaNode={childNode} nestingLevel={currentNestingLevel + (shouldIndent ? 1 : 0)} />
      </React.Fragment>
    ))}
  </div>
);

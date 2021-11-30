import { SchemaNode } from '@stoplight/json-schema-tree';
import { Box } from '@stoplight/mosaic';
import * as React from 'react';

import { NESTING_OFFSET } from '../../consts';
import { SchemaRow, SchemaRowProps } from '../SchemaRow';

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
  <Box className={className} pl={NESTING_OFFSET} fontSize="sm">
    {childNodes.map((childNode: SchemaNode, index) => (
      <React.Fragment key={childNode.id}>
        {index > 0 && <Box borderT borderColor="light" alignSelf="stretch" />}

        <RowComponent schemaNode={childNode} nestingLevel={currentNestingLevel + 1} />
      </React.Fragment>
    ))}
  </Box>
);

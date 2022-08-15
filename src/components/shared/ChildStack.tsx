import { SchemaNode } from '@stoplight/json-schema-tree';
import { Box, SpaceVals } from '@stoplight/mosaic';
import * as React from 'react';

import { NESTING_OFFSET } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { SchemaRow, SchemaRowProps } from '../SchemaRow';

type ChildStackProps = {
  schemaNode: SchemaNode;
  childNodes: readonly SchemaNode[];
  currentNestingLevel: number;
  className?: string;
  parentNodeId?: string;
  RowComponent?: React.FC<SchemaRowProps>;
};

export const ChildStack = React.memo(
  ({ childNodes, currentNestingLevel, className, RowComponent = SchemaRow, parentNodeId }: ChildStackProps) => {
    const { renderRootTreeLines } = useJSVOptionsContext();
    const rootLevel = renderRootTreeLines ? 0 : 1;
    const isRootLevel = currentNestingLevel < rootLevel;

    let ml: SpaceVals | undefined;
    if (!isRootLevel) {
      ml = currentNestingLevel === rootLevel ? 'px' : 7;
    }

    return (
      <Box
        className={className}
        ml={ml}
        fontSize="sm"
        borderL={isRootLevel ? undefined : true}
        data-level={currentNestingLevel}
      >
        {childNodes.map((childNode: SchemaNode) => (
          <RowComponent
            key={childNode.id}
            schemaNode={childNode}
            nestingLevel={currentNestingLevel + 1}
            pl={isRootLevel ? undefined : NESTING_OFFSET}
            parentNodeId={parentNodeId}
          />
        ))}
      </Box>
    );
  },
);

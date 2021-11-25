import { SchemaNode } from '@stoplight/json-schema-tree';
import { SpaceVals, VStack } from '@stoplight/mosaic';
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
}: ChildStackProps) => {
  const isRootLevel = currentNestingLevel <= 0;

  let ml: SpaceVals | undefined;
  if (!isRootLevel) {
    ml = currentNestingLevel === 1 ? 1 : 5;
  }

  return (
    <VStack
      className={className}
      pl={isRootLevel ? undefined : NESTING_OFFSET}
      ml={ml}
      spacing={4}
      fontSize="sm"
      borderL={isRootLevel ? undefined : true}
      data-level={currentNestingLevel}
      onMouseEnter={e => {
        e.stopPropagation();
        console.log('MOUSE OVER', e, currentNestingLevel);
      }}
    >
      {childNodes.map((childNode: SchemaNode) => (
        <RowComponent key={childNode.id} schemaNode={childNode} nestingLevel={currentNestingLevel + 1} />
      ))}
    </VStack>
  );
};

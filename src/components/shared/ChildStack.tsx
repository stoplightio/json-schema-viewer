import { SchemaNode } from '@stoplight/json-schema-tree';
import { SpaceVals, VStack } from '@stoplight/mosaic';
import * as React from 'react';

import { NESTING_OFFSET } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
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
  const { renderRootTreeLines } = useJSVOptionsContext();
  const rootLevel = renderRootTreeLines ? 0 : 1;
  const isRootLevel = currentNestingLevel < rootLevel;

  let ml: SpaceVals | undefined;
  if (!isRootLevel) {
    ml = currentNestingLevel === rootLevel ? 'px' : 7;
  }

  return (
    <VStack
      className={className}
      // pl={isRootLevel ? undefined : NESTING_OFFSET}
      ml={ml}
      // spacing={4}
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
        />
      ))}
    </VStack>
  );
};

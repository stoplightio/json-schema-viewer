import { SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { ChildNode, isParentNode } from '../../tree';

export const useChildSelector = (schemaNode: SchemaNode) => {
  const [selectedChild, setSelectedChild] = React.useState<ChildNode | undefined>(
    isParentNode(schemaNode) && shouldShowChildSelector(schemaNode) ? schemaNode.children[0] : undefined,
  );

  React.useEffect(() => {
    setSelectedChild(
      isParentNode(schemaNode) && shouldShowChildSelector(schemaNode) ? schemaNode.children[0] : undefined,
    );
  }, [schemaNode]);

  const childOptions =
    isParentNode(schemaNode) && shouldShowChildSelector(schemaNode) ? schemaNode.children : ([] as ChildNode[]);

  const actualSelectedChild = selectedChild && childOptions.includes(selectedChild) ? selectedChild : undefined;

  return { selectedChild: actualSelectedChild, setSelectedChild, childOptions };
};

const shouldShowChildSelector = (schemaNode: SchemaNode) =>
  isParentNode(schemaNode) && ['anyOf', 'oneOf'].includes(schemaNode.combiners?.[0] ?? '');

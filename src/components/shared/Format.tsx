import { isRegularNode } from '@stoplight/json-schema-tree';
import cn from 'classnames';
import * as React from 'react';
import { useSchemaNode } from '../../hooks/useSchemaNode';

export const Format: React.FunctionComponent = () => {
  const schemaNode = useSchemaNode();

  if (!isRegularNode(schemaNode) || schemaNode.format === null) {
    return null;
  }

  return <span className={cn('ml-2', 'text-gray-5 dark:text-gray-3')}>{`<${schemaNode.format}>`}</span>;
};

import { isRegularNode, SchemaTree as JsonSchemaTree, SchemaTreeRefDereferenceFn } from '@stoplight/json-schema-tree';
import { Box, VStack } from '@stoplight/mosaic';
import { ErrorBoundaryForwardedProps, FallbackProps, withErrorBoundary } from '@stoplight/react-error-boundary';
import cn from 'classnames';
import type { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JSVOptionsContextProvider } from '../contexts';
import type { ViewMode } from '../types';
import { SchemaRow } from './SchemaRow';

export interface IJsonSchemaViewer {
  schema: JSONSchema4;
  emptyText?: string;
  defaultExpandedDepth?: number;
  className?: string;
  resolveRef?: SchemaTreeRefDereferenceFn;
  viewMode?: ViewMode;
}

const JsonSchemaViewerComponent: React.FC<IJsonSchemaViewer & ErrorBoundaryForwardedProps> = ({
  schema,
  viewMode = 'standalone',
  className,
  resolveRef,
  emptyText = 'No schema defined',
  defaultExpandedDepth = 2,
}) => {
  const jsonSchemaTreeRoot = React.useMemo(() => {
    const jsonSchemaTree = new JsonSchemaTree(schema, {
      mergeAllOf: true,
      refResolver: resolveRef,
    });
    jsonSchemaTree.walker.hookInto('filter', node => {
      if (!isRegularNode(node)) return true;

      const { validations } = node;

      if (!!validations.writeOnly === !!validations.readOnly) {
        return true;
      }

      return !((viewMode === 'read' && !!validations.writeOnly) || (viewMode === 'write' && !!validations.readOnly));
    });
    jsonSchemaTree.populate();
    return jsonSchemaTree.root;
  }, [schema, resolveRef, viewMode]);

  const isEmpty = React.useMemo(() => jsonSchemaTreeRoot.children.every(node => !isRegularNode(node) || node.unknown), [
    jsonSchemaTreeRoot,
  ]);

  const options = React.useMemo(() => ({ defaultExpandedDepth, viewMode }), [defaultExpandedDepth, viewMode]);

  if (isEmpty) {
    return <Box className={cn(className, 'JsonSchemaViewer')}>{emptyText}</Box>;
  }

  return (
    <JSVOptionsContextProvider value={options}>
      <VStack divider className={cn(className, 'JsonSchemaViewer')}>
        {jsonSchemaTreeRoot.children.map(childJsonSchemaNode => (
          <SchemaRow key={childJsonSchemaNode.id} schemaNode={childJsonSchemaNode} nestingLevel={0} />
        ))}
      </VStack>
    </JSVOptionsContextProvider>
  );
};

const JsonSchemaFallbackComponent: React.FC<FallbackProps> = ({ error }) => {
  return (
    <Box p={4}>
      <b className="text-danger">Error</b>
      {error !== null ? `: ${error.message}` : null}
    </Box>
  );
};

export const JsonSchemaViewer = withErrorBoundary<IJsonSchemaViewer>(JsonSchemaViewerComponent, {
  FallbackComponent: JsonSchemaFallbackComponent,
  recoverableProps: ['schema'],
  reportErrors: false,
});

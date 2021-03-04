import { isRegularNode, SchemaTree as JsonSchemaTree, SchemaTreeRefDereferenceFn } from '@stoplight/json-schema-tree';
import { Box, Flex, VStack } from '@stoplight/mosaic';
import { ErrorBoundaryForwardedProps, FallbackComponent, withErrorBoundary } from '@stoplight/react-error-boundary';
import cn from 'classnames';
import type { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JSVOptionsContextProvider, ViewModeContext } from '../contexts';
import type { ViewMode } from '../types';
import { SchemaRow } from './SchemaRow';

export interface IJsonSchemaViewer {
  schema: JSONSchema4;
  emptyText?: string;
  defaultExpandedDepth?: number;
  className?: string;
  maxRows?: number;
  FallbackComponent?: typeof FallbackComponent;
  resolveRef?: SchemaTreeRefDereferenceFn;
  viewMode?: ViewMode;
}

const JsonSchemaViewerComponent: React.FC<IJsonSchemaViewer & ErrorBoundaryForwardedProps> = ({
  schema,
  viewMode,
  className,
  resolveRef,
  emptyText = 'No schema defined',
  maxRows = Infinity,
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

  const options = React.useMemo(() => ({ defaultExpandedDepth, maxRows }), [defaultExpandedDepth, maxRows]);

  if (isEmpty) {
    return <div>{emptyText}</div>;
  }

  return (
    <Flex pos="relative" h="full" className={cn(className, 'JsonSchemaViewer')} overflowY={'scroll'}>
      <JSVOptionsContextProvider value={options}>
        <ViewModeContext.Provider value={viewMode ?? 'standalone'}>
          <VStack divider>
            {jsonSchemaTreeRoot.children.map(childJsonSchemaNode => (
              <SchemaRow key={childJsonSchemaNode.id} schemaNode={childJsonSchemaNode} />
            ))}
          </VStack>
        </ViewModeContext.Provider>
      </JSVOptionsContextProvider>
    </Flex>
  );
};

const JsonSchemaFallbackComponent: typeof FallbackComponent = ({ error }) => {
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

import { isRegularNode, SchemaTree as JsonSchemaTree, SchemaTreeRefDereferenceFn } from '@stoplight/json-schema-tree';
import { Box, Provider as MosaicProvider } from '@stoplight/mosaic';
import { ErrorBoundaryForwardedProps, FallbackProps, withErrorBoundary } from '@stoplight/react-error-boundary';
import cn from 'classnames';
import * as React from 'react';

import { JSVOptions, JSVOptionsContextProvider } from '../contexts';
import type { JSONSchema } from '../types';
import { TopLevelSchemaRow } from './SchemaRow';
import { ChildStack } from './shared/ChildStack';

export type JsonSchemaProps = Partial<JSVOptions> & {
  schema: JSONSchema;
  emptyText?: string;
  className?: string;
  resolveRef?: SchemaTreeRefDereferenceFn;
};

const JsonSchemaViewerComponent: React.FC<JsonSchemaProps & ErrorBoundaryForwardedProps> = ({
  schema,
  viewMode = 'standalone',
  className,
  resolveRef,
  emptyText = 'No schema defined',
  defaultExpandedDepth = 2,
  onGoToRef,
  renderRowAddon,
  hideExamples,
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

  const options = React.useMemo(() => ({ defaultExpandedDepth, viewMode, onGoToRef, renderRowAddon, hideExamples }), [
    defaultExpandedDepth,
    viewMode,
    onGoToRef,
    renderRowAddon,
    hideExamples,
  ]);

  if (isEmpty) {
    return <Box className={cn(className, 'JsonSchemaViewer', 'sl-text-sm')}>{emptyText}</Box>;
  }

  return (
    <MosaicProvider>
      <JSVOptionsContextProvider value={options}>
        <ChildStack
          childNodes={jsonSchemaTreeRoot.children}
          currentNestingLevel={-1}
          className={cn(className, 'JsonSchemaViewer', 'sl-text-sm')}
          RowComponent={TopLevelSchemaRow}
        />
      </JSVOptionsContextProvider>
    </MosaicProvider>
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

export const JsonSchemaViewer = withErrorBoundary<JsonSchemaProps>(JsonSchemaViewerComponent, {
  FallbackComponent: JsonSchemaFallbackComponent,
  recoverableProps: ['schema'],
  reportErrors: false,
});

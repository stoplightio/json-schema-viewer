import {
  isRegularNode,
  RootNode,
  SchemaNode,
  SchemaTree as JsonSchemaTree,
  SchemaTreeRefDereferenceFn,
} from '@stoplight/json-schema-tree';
import { Box, Provider as MosaicProvider } from '@stoplight/mosaic';
import { ErrorBoundaryForwardedProps, FallbackProps, withErrorBoundary } from '@stoplight/react-error-boundary';
import cn from 'classnames';
import { Provider } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import * as React from 'react';

import { JSVOptions, JSVOptionsContextProvider } from '../contexts';
import type { DiffRenderer, JSONSchema } from '../types';
import { PathCrumbs } from './PathCrumbs';
import { TopLevelSchemaRow } from './SchemaRow';
import { hoveredNodeAtom } from './SchemaRow/state';

export type JsonSchemaProps = Partial<JSVOptions> & {
  schema: JSONSchema;
  emptyText?: string;
  className?: string;
  resolveRef?: SchemaTreeRefDereferenceFn;
  onTreePopulated?: (props: { rootNode: RootNode; nodeCount: number }) => void;
  maxHeight?: number;
  parentCrumbs?: string[];
} & DiffRenderer;

const JsonSchemaViewerComponent = ({
  viewMode = 'standalone',
  defaultExpandedDepth = 1,
  onGoToRef,
  renderRowAddon,
  hideExamples,
  renderRootTreeLines,
  disableCrumbs,
  nodeHasChanged,
  ...rest
}: JsonSchemaProps & ErrorBoundaryForwardedProps) => {
  const options = React.useMemo(
    () => ({
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      hideExamples,
      renderRootTreeLines,
      disableCrumbs,
      nodeHasChanged,
    }),
    [
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      hideExamples,
      renderRootTreeLines,
      disableCrumbs,
      nodeHasChanged,
    ],
  );

  return (
    <MosaicProvider>
      <JSVOptionsContextProvider value={options}>
        <Provider>
          <JsonSchemaViewerInner viewMode={viewMode} {...rest} />
        </Provider>
      </JSVOptionsContextProvider>
    </MosaicProvider>
  );
};

const JsonSchemaViewerInner = ({
  schema,
  viewMode,
  className,
  resolveRef,
  emptyText = 'No schema defined',
  onTreePopulated,
  maxHeight,
  parentCrumbs,
}: Pick<
  JsonSchemaProps,
  'schema' | 'viewMode' | 'className' | 'resolveRef' | 'emptyText' | 'onTreePopulated' | 'maxHeight' | 'parentCrumbs'
>) => {
  const setHoveredNode = useUpdateAtom(hoveredNodeAtom);
  const onMouseLeave = React.useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const { jsonSchemaTreeRoot, nodeCount } = React.useMemo(() => {
    const jsonSchemaTree = new JsonSchemaTree(schema, {
      mergeAllOf: true,
      refResolver: resolveRef,
    });

    let nodeCount = 0;
    const shouldNodeBeIncluded = (node: SchemaNode) => {
      if (!isRegularNode(node)) return true;

      const { validations } = node;

      if (!!validations.writeOnly === !!validations.readOnly) {
        return true;
      }

      return !((viewMode === 'read' && !!validations.writeOnly) || (viewMode === 'write' && !!validations.readOnly));
    };

    jsonSchemaTree.walker.hookInto('filter', node => {
      if (shouldNodeBeIncluded(node)) {
        nodeCount++;
        return true;
      }
      return false;
    });
    jsonSchemaTree.populate();

    return {
      jsonSchemaTreeRoot: jsonSchemaTree.root,
      nodeCount,
    };
  }, [schema, resolveRef, viewMode]);

  React.useEffect(() => {
    onTreePopulated?.({
      rootNode: jsonSchemaTreeRoot,
      nodeCount: nodeCount,
    });
  }, [jsonSchemaTreeRoot, onTreePopulated, nodeCount]);

  const isEmpty = React.useMemo(
    () => jsonSchemaTreeRoot.children.every(node => !isRegularNode(node) || node.unknown),
    [jsonSchemaTreeRoot],
  );
  if (isEmpty) {
    return (
      <Box className={cn(className, 'JsonSchemaViewer')} fontSize="sm">
        {emptyText}
      </Box>
    );
  }

  return (
    <Box
      className={cn('JsonSchemaViewer', className)}
      pos={maxHeight ? 'relative' : undefined}
      overflowY={maxHeight ? 'auto' : undefined}
      onMouseLeave={onMouseLeave}
      style={{ maxHeight }}
    >
      <PathCrumbs parentCrumbs={parentCrumbs} />
      <TopLevelSchemaRow schemaNode={jsonSchemaTreeRoot.children[0]} />
    </Box>
  );
};

const JsonSchemaFallbackComponent = ({ error }: FallbackProps) => {
  return (
    <Box p={4}>
      <Box as="b" color="danger">
        Error
      </Box>
      {error !== null ? `: ${error.message}` : null}
    </Box>
  );
};

export const JsonSchemaViewer = withErrorBoundary<JsonSchemaProps>(JsonSchemaViewerComponent, {
  FallbackComponent: JsonSchemaFallbackComponent,
  recoverableProps: ['schema'],
});

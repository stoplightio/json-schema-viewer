import {
  isRegularNode,
  RootNode,
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
import { shouldNodeBeIncluded } from '../tree/utils';
import { JSONSchema } from '../types';
import { PathCrumbs } from './PathCrumbs';
import { TopLevelSchemaRow } from './SchemaRow';
import { hoveredNodeAtom } from './SchemaRow/state';

export type JsonSchemaProps = Partial<JSVOptions> & {
  schema: JSONSchema;
  emptyText?: string;
  className?: string;
  resolveRef?: SchemaTreeRefDereferenceFn;
  /** Controls the level of recursion of refs. Prevents overly complex trees and running out of stack depth. */
  maxRefDepth?: number;
  onTreePopulated?: (props: { rootNode: RootNode; nodeCount: number }) => void;
  maxHeight?: number;
  parentCrumbs?: string[];
  skipTopLevelDescription?: boolean;
};

const JsonSchemaViewerComponent = ({
  viewMode = 'standalone',
  defaultExpandedDepth = 1,
  onGoToRef,
  renderRowAddon,
  renderExtensionAddon,
  hideExamples,
  renderRootTreeLines,
  disableCrumbs,
  nodeHasChanged,
  skipTopLevelDescription,
  ...rest
}: JsonSchemaProps & ErrorBoundaryForwardedProps) => {
  const options = React.useMemo(
    () => ({
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      renderExtensionAddon,
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
      renderExtensionAddon,
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
          <JsonSchemaViewerInner viewMode={viewMode} skipTopLevelDescription={skipTopLevelDescription} {...rest} />
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
  maxRefDepth,
  emptyText = 'No schema defined',
  onTreePopulated,
  maxHeight,
  parentCrumbs,
  skipTopLevelDescription,
}: Pick<
  JsonSchemaProps,
  | 'schema'
  | 'viewMode'
  | 'className'
  | 'resolveRef'
  | 'maxRefDepth'
  | 'emptyText'
  | 'onTreePopulated'
  | 'maxHeight'
  | 'parentCrumbs'
  | 'skipTopLevelDescription'
>) => {
  const setHoveredNode = useUpdateAtom(hoveredNodeAtom);
  const onMouseLeave = React.useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const { jsonSchemaTreeRoot, nodeCount } = React.useMemo(() => {
    const jsonSchemaTree = new JsonSchemaTree(schema, {
      mergeAllOf: true,
      refResolver: resolveRef,
      maxRefDepth,
    });

    let nodeCount = 0;

    jsonSchemaTree.walker.hookInto('filter', node => {
      if (shouldNodeBeIncluded(node, viewMode)) {
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
  }, [schema, resolveRef, maxRefDepth, viewMode]);

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
      <TopLevelSchemaRow schemaNode={jsonSchemaTreeRoot.children[0]} skipDescription={skipTopLevelDescription} />
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

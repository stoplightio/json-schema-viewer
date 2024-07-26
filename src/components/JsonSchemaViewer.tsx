import {
  isRegularNode,
  RootNode,
  SchemaNodeKind,
  SchemaTree as JsonSchemaTree,
  SchemaTreeRefDereferenceFn,
} from '@stoplight/json-schema-tree';
import { Box, Button, HStack, Provider as MosaicProvider } from '@stoplight/mosaic';
import { ErrorBoundaryForwardedProps, FallbackProps, withErrorBoundary } from '@stoplight/react-error-boundary';
import cn from 'classnames';
import { Provider, useAtom, useSetAtom } from 'jotai';
import * as React from 'react';

import { JSVOptions, JSVOptionsContextProvider } from '../contexts';
import { isNonEmptyParentNode, shouldNodeBeIncluded } from '../tree/utils';
import { JSONSchema } from '../types';
import { PathCrumbs } from './PathCrumbs';
import { TopLevelSchemaRow } from './SchemaRow';
import { ExpansionMode, expansionModeAtom, hoveredNodeAtom } from './SchemaRow/state';

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
  showExpandAll?: boolean;
};

const JsonSchemaViewerComponent = ({
  viewMode = 'standalone',
  defaultExpandedDepth = 1,
  maxRefDepth,
  showExpandAll = true,
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
      maxRefDepth,
      viewMode,
      showExpandAll,
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
      maxRefDepth,
      viewMode,
      showExpandAll,
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
          <JsonSchemaViewerInner
            viewMode={viewMode}
            showExpandAll={showExpandAll}
            skipTopLevelDescription={skipTopLevelDescription}
            {...rest}
          />
        </Provider>
      </JSVOptionsContextProvider>
    </MosaicProvider>
  );
};

const JsonSchemaViewerInner = ({
  schema,
  viewMode,
  showExpandAll,
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
  | 'showExpandAll'
  | 'className'
  | 'resolveRef'
  | 'maxRefDepth'
  | 'emptyText'
  | 'onTreePopulated'
  | 'maxHeight'
  | 'parentCrumbs'
  | 'skipTopLevelDescription'
>) => {
  const setHoveredNode = useSetAtom(hoveredNodeAtom);
  const [expansionMode, setExpansionMode] = useAtom(expansionModeAtom);

  const onMouseLeave = React.useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const onCollapseExpandAll = React.useCallback(() => {
    const newExpansionMode: ExpansionMode = expansionMode === 'expand_all' ? 'collapse_all' : 'expand_all';
    setExpansionMode(newExpansionMode);
  }, [expansionMode, setExpansionMode]);

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

  // Naive check if there are collapsible rows
  const hasCollapsibleRows = React.useMemo(() => {
    if (jsonSchemaTreeRoot.children.length === 0) {
      return false;
    }

    if (isNonEmptyParentNode(jsonSchemaTreeRoot.children[0])) {
      return jsonSchemaTreeRoot.children[0].children.some(childNode => {
        return isRegularNode(childNode) && childNode.primaryType === SchemaNodeKind.Object;
      });
    }
    return false;
  }, [jsonSchemaTreeRoot]);

  if (isEmpty) {
    return (
      <Box className={cn(className, 'JsonSchemaViewer')} fontSize="sm" data-test="empty-text">
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
      {hasCollapsibleRows && showExpandAll ? (
        <HStack w="full" fontFamily="mono" fontSize="sm" lineHeight="none" bg="canvas-pure" px="px" color="light">
          <Box flex={1}>&nbsp;</Box>
          <Button pl={1} mr={1} size="sm" appearance="minimal" onClick={onCollapseExpandAll}>
            {expansionMode === 'expand_all' ? 'Collapse All' : 'Expand All'}
          </Button>
        </HStack>
      ) : null}
      <PathCrumbs parentCrumbs={parentCrumbs} showExpandAll={showExpandAll} />
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

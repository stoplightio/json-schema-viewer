import { isMirroredNode, isReferenceNode, isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { Box, Flex, NodeAnnotation, Select, SpaceVals, VStack } from '@stoplight/mosaic';
import type { ChangeType } from '@stoplight/types';
import { Atom, useAtomValue, useSetAtom } from 'jotai';
import last from 'lodash/last.js';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { getNodeId, getOriginalNodeId } from '../../hash';
import { isPropertyRequired, visibleChildren } from '../../tree';
import { extractVendorExtensions } from '../../utils/extractVendorExtensions';
import { Caret, Description, getValidationsFromSchema, Types, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Error } from '../shared/Error';
import { Properties, useHasProperties } from '../shared/Properties';
import { expansionModeAtom, hoveredNodeAtom, isNodeHoveredAtom } from './state';
import { useChoices } from './useChoices';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
  pl?: SpaceVals;
  parentNodeId?: string;
  parentChangeType?: ChangeType;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = React.memo(
  ({ schemaNode, nestingLevel, pl, parentNodeId, parentChangeType }) => {
    const {
      defaultExpandedDepth,
      renderRowAddon,
      renderExtensionAddon,
      onGoToRef,
      hideExamples,
      renderRootTreeLines,
      nodeHasChanged,
      viewMode,
    } = useJSVOptionsContext();

    const setHoveredNode = useSetAtom(hoveredNodeAtom);

    const expansionMode = useAtomValue(expansionModeAtom);

    const nodeId = getNodeId(schemaNode, parentNodeId);

    // @ts-expect-error originalFragment does exist...
    const originalNodeId = schemaNode.originalFragment?.$ref ? getOriginalNodeId(schemaNode, parentNodeId) : nodeId;
    const mode = viewMode === 'standalone' ? undefined : viewMode;
    const hasChanged = nodeHasChanged?.({ nodeId: originalNodeId, mode });

    const [isExpanded, setExpanded] = React.useState<boolean>(
      expansionMode === 'expand_all' ? true : !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
    );

    const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
    const typeToShow = selectedChoice.type;
    const description = isRegularNode(typeToShow) ? typeToShow.annotations.description : null;

    const rootLevel = renderRootTreeLines ? 1 : 2;
    const childNodes = React.useMemo(() => visibleChildren(typeToShow), [typeToShow]);
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;
    const isCollapsible = childNodes.length > 0;
    const isRootLevel = nestingLevel < rootLevel;

    const required = isPropertyRequired(schemaNode);
    const deprecated = isRegularNode(schemaNode) && schemaNode.deprecated;
    const validations = isRegularNode(schemaNode) ? schemaNode.validations : {};
    const hasProperties = useHasProperties({ required, deprecated, validations });

    React.useEffect(() => {
      if (expansionMode === 'expand_all' && !isExpanded) {
        setExpanded(true);
      } else if (expansionMode === 'collapse_all' && isExpanded) {
        setExpanded(false);
      }
    }, [isExpanded, expansionMode]);

    const [totalVendorExtensions, vendorExtensions] = React.useMemo(
      () => extractVendorExtensions(schemaNode.fragment),
      [schemaNode.fragment],
    );
    const hasVendorProperties = totalVendorExtensions > 0;

    const annotationRootOffset = renderRootTreeLines ? 0 : 8;
    let annotationLeftOffset = -20 - annotationRootOffset;
    if (nestingLevel > 1) {
      // annotationLeftOffset -= 27;
      annotationLeftOffset =
        -1 * 29 * Math.max(nestingLevel - 1, 1) - Math.min(nestingLevel, 2) * 2 - 16 - annotationRootOffset;

      if (!renderRootTreeLines) {
        annotationLeftOffset += 27;
      }
    }

    if (parentChangeType === 'added' && hasChanged && hasChanged.type === 'removed') {
      return null;
    }

    if (parentChangeType === 'removed' && hasChanged && hasChanged.type === 'added') {
      return null;
    }

    return (
      <>
        <Flex
          maxW="full"
          pl={pl}
          py={2}
          data-id={originalNodeId}
          data-test="schema-row"
          pos="relative"
          onMouseEnter={(e: any) => {
            e.stopPropagation();
            setHoveredNode(selectedChoice.type);
          }}
        >
          {!isRootLevel && <Box borderT w={isCollapsible ? 1 : 3} ml={-3} mr={3} mt={2} />}
          {parentChangeType !== 'added' && parentChangeType !== 'removed' ? (
            <NodeAnnotation change={hasChanged} style={{ left: annotationLeftOffset }} />
          ) : null}
          <VStack spacing={1} maxW="full" flex={1} ml={isCollapsible && !isRootLevel ? 2 : undefined}>
            <Flex
              alignItems="center"
              maxW="full"
              onClick={isCollapsible ? () => setExpanded(!isExpanded) : undefined}
              cursor={isCollapsible ? 'pointer' : undefined}
            >
              {isCollapsible ? <Caret isExpanded={isExpanded} /> : null}
              <Flex alignItems="baseline" fontSize="base">
                {schemaNode.subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
                  <Box
                    mr={2}
                    fontFamily="mono"
                    fontWeight="semibold"
                    data-test={`property-name-${last(schemaNode.subpath)}`}
                  >
                    {last(schemaNode.subpath)}
                  </Box>
                )}

                {choices.length === 1 && <Types schemaNode={typeToShow} />}

                {onGoToRef && isReferenceNode(schemaNode) && schemaNode.external ? (
                  <Box
                    as="a"
                    ml={2}
                    cursor="pointer"
                    color="primary-light"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onGoToRef(schemaNode);
                    }}
                  >
                    (go to ref)
                  </Box>
                ) : null}

                {schemaNode.subpath.length > 1 && schemaNode.subpath[0] === 'patternProperties' ? (
                  <Box ml={2} color="muted">
                    (pattern property)
                  </Box>
                ) : null}

                {choices.length > 1 && (
                  <Select
                    aria-label="Pick a type"
                    size="sm"
                    triggerTextPrefix={combiner ? `${COMBINER_NAME_MAP[combiner]}: ` : undefined}
                    options={choices.map((choice, index) => ({
                      value: String(index),
                      label: choice.title,
                    }))}
                    value={
                      String(choices.indexOf(selectedChoice))
                      /* String to work around https://github.com/stoplightio/mosaic/issues/162 */
                    }
                    onChange={selectedIndex => setSelectedChoice(choices[selectedIndex as number])}
                  />
                )}
              </Flex>
              {hasProperties && <Divider atom={isNodeHoveredAtom(schemaNode)} />}
              <Properties required={required} deprecated={deprecated} validations={validations} />
            </Flex>
            {typeof description === 'string' && description.length > 0 && <Description value={description} />}
            <Validations
              validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}}
              hideExamples={hideExamples}
            />
            {hasVendorProperties && renderExtensionAddon ? (
              <Box>{renderExtensionAddon({ schemaNode, nestingLevel, vendorExtensions })}</Box>
            ) : null}
          </VStack>
          <Error schemaNode={schemaNode} />
          {renderRowAddon ? <Box>{renderRowAddon({ schemaNode, nestingLevel })}</Box> : null}
        </Flex>
        {isCollapsible && isExpanded ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
            parentChangeType={parentChangeType ? parentChangeType : hasChanged ? hasChanged?.type : undefined}
          />
        ) : null}
      </>
    );
  },
);

const Divider = ({ atom }: { atom: Atom<boolean> }) => {
  const isHovering = useAtomValue(atom);

  return <Box bg={isHovering ? 'canvas-200' : undefined} h="px" flex={1} mx={3} />;
};

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}

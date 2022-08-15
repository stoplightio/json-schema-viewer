import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  ReferenceNode,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { BackgroundColorVals, Box, BoxProps, Flex, Icon, Select, SpaceVals, VStack } from '@stoplight/mosaic';
import { Atom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import last from 'lodash/last.js';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { getNodeId, getOriginalNodeId } from '../../hash';
import { calculateChildrenToShow, isFlattenableNode, isPropertyRequired } from '../../tree';
import { ChangeType, NodeHasChangedFn } from '../../types';
import { Caret, Description, getInternalSchemaError, getValidationsFromSchema, Types, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Properties, useHasProperties } from '../shared/Properties';
import { hoveredNodeAtom, isNodeHoveredAtom } from './state';
import { useChoices } from './useChoices';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
  pl?: SpaceVals;
  parentNodeId?: string;
}

const ChangeTypeToColor: Record<ChangeType, BackgroundColorVals> = {
  // @ts-expect-error
  added: '#05B870',
  // @ts-expect-error
  modified: '#E9B703',
  // @ts-expect-error
  removed: '#F05151',
};

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = React.memo(
  ({ schemaNode, nestingLevel, pl, parentNodeId }) => {
    const { defaultExpandedDepth, renderRowAddon, onGoToRef, hideExamples, renderRootTreeLines, nodeHasChanged } =
      useJSVOptionsContext();

    const setHoveredNode = useUpdateAtom(hoveredNodeAtom);

    const nodeId = getNodeId(schemaNode, parentNodeId);

    // @ts-expect-error originalFragment does exist...
    const originalNodeId = schemaNode.originalFragment?.$ref ? getOriginalNodeId(schemaNode, parentNodeId) : nodeId;
    const hasChanged = nodeHasChanged?.({ nodeId: originalNodeId });

    const [isExpanded, setExpanded] = React.useState<boolean>(
      !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
    );

    const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
    const typeToShow = selectedChoice.type;
    const description = isRegularNode(typeToShow) ? typeToShow.annotations.description : null;

    const refNode = React.useMemo<ReferenceNode | null>(() => {
      if (isReferenceNode(schemaNode)) {
        return schemaNode;
      }

      if (
        isRegularNode(schemaNode) &&
        (isFlattenableNode(schemaNode) ||
          (schemaNode.primaryType === SchemaNodeKind.Array && schemaNode.children?.length === 1))
      ) {
        return (schemaNode.children?.find(isReferenceNode) as ReferenceNode | undefined) ?? null;
      }

      return null;
    }, [schemaNode]);

    const isBrokenRef = typeof refNode?.error === 'string';

    const rootLevel = renderRootTreeLines ? 1 : 2;
    const childNodes = React.useMemo(() => calculateChildrenToShow(typeToShow), [typeToShow]);
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;
    const isCollapsible = childNodes.length > 0;
    const isRootLevel = nestingLevel < rootLevel;

    const required = isPropertyRequired(schemaNode);
    const deprecated = isRegularNode(schemaNode) && schemaNode.deprecated;
    const validations = isRegularNode(schemaNode) ? schemaNode.validations : {};
    const hasProperties = useHasProperties({ required, deprecated, validations });

    const internalSchemaError = getInternalSchemaError(schemaNode);

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

    return (
      <>
        <Flex
          maxW="full"
          pl={pl}
          py={2}
          data-id={originalNodeId}
          pos="relative"
          onMouseEnter={(e: any) => {
            e.stopPropagation();
            setHoveredNode(selectedChoice.type);
          }}
        >
          {!isRootLevel && <Box borderT w={isCollapsible ? 1 : 3} ml={-3} mr={3} mt={2} />}

          <ChangeAnnotation change={hasChanged} style={{ left: annotationLeftOffset }} />

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
                  <Box mr={2} fontFamily="mono" fontWeight="semibold">
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

            {(isBrokenRef || internalSchemaError.hasError) && (
              <Icon
                title={refNode?.error! || internalSchemaError.error}
                color="danger"
                icon={['fas', 'exclamation-triangle']}
                size="sm"
              />
            )}
          </VStack>

          {renderRowAddon ? <Box>{renderRowAddon({ schemaNode, nestingLevel })}</Box> : null}
        </Flex>

        {isCollapsible && isExpanded ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
        ) : null}
      </>
    );
  },
);

const ChangeAnnotation = ({ change, ...props }: { change?: ReturnType<NodeHasChangedFn> } & BoxProps<'div'>) => {
  if (!change) return null;

  const { style = {}, ...rest } = props;

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const selfAffected = change.selfAffected || change.type === 'added' || change.type === 'removed';

  return (
    <Box
      w={1.5}
      pos="absolute"
      pinY="px"
      bg={selfAffected ? ChangeTypeToColor[change.type] : undefined}
      rounded
      style={{
        ...style,
        borderWidth: 2,
        borderColor: selfAffected ? 'transparent' : ChangeTypeToColor[change.type],
      }}
      {...rest}
    >
      <Box pos="absolute" right={3} pinY fontSize="lg" display="flex" alignItems="center">
        {change.isBreaking ? (
          <Box color="danger">
            <Icon icon={[selfAffected ? 'fas' : 'far', 'exclamation-circle']} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

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

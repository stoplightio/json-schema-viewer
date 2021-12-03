import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle.js';
import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  ReferenceNode,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Box, Flex, Icon, Select, SpaceVals, VStack } from '@stoplight/mosaic';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import last from 'lodash/last.js';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { calculateChildrenToShow, isFlattenableNode, isPropertyRequired } from '../../tree';
import { Caret, Description, Format, getValidationsFromSchema, Types, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Properties, useHasProperties } from '../shared/Properties';
import { hoveredNodeAtom, isNodeHoveredAtom } from './state';
import { useChoices } from './useChoices';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
  pl?: SpaceVals;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = React.memo(({ schemaNode, nestingLevel, pl }) => {
  const { defaultExpandedDepth, renderRowAddon, onGoToRef, hideExamples, renderRootTreeLines } = useJSVOptionsContext();

  const setHoveredNode = useUpdateAtom(hoveredNodeAtom);
  const isHovering = useAtomValue(isNodeHoveredAtom(schemaNode));

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

  return (
    <>
      <Flex
        maxW="full"
        pl={pl}
        py={2}
        onMouseEnter={(e: any) => {
          e.stopPropagation();
          setHoveredNode(selectedChoice.type);
        }}
      >
        {!isRootLevel && <Box borderT w={isCollapsible ? 1 : 3} ml={-3} mr={3} mt={2} />}

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

              {choices.length === 1 && (
                <>
                  <Types schemaNode={typeToShow} />
                  <Format schemaNode={typeToShow} />
                </>
              )}

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

            {hasProperties && <Box bg={isHovering ? 'canvas-200' : undefined} h="px" flex={1} mx={3} />}

            <Properties required={required} deprecated={deprecated} validations={validations} />
          </Flex>

          {typeof description === 'string' && description.length > 0 && <Description value={description} />}

          <Validations
            validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}}
            hideExamples={hideExamples}
          />

          {isBrokenRef && (
            // TODO (JJ): Add mosaic tooltip showing ref error
            <Icon title={refNode!.error!} color="danger" icon={faExclamationTriangle} size="sm" />
          )}
        </VStack>

        {renderRowAddon ? <Box>{renderRowAddon({ schemaNode, nestingLevel })}</Box> : null}
      </Flex>

      {isCollapsible && isExpanded ? (
        <ChildStack schemaNode={schemaNode} childNodes={childNodes} currentNestingLevel={nestingLevel} />
      ) : null}
    </>
  );
});

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}

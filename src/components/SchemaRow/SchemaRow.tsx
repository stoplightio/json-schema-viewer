import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle.js';
import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  ReferenceNode,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Box, Flex, Icon, Select } from '@stoplight/mosaic';
import last from 'lodash/last.js';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';
import { calculateChildrenToShow, isFlattenableNode, isPropertyRequired } from '../../tree';
import { Caret, Description, Format, getValidationsFromSchema, Types, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Properties } from '../shared/Properties';
import { useChoices } from './useChoices';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const { defaultExpandedDepth, renderRowAddon, onGoToRef, hideExamples } = useJSVOptionsContext();

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

  const childNodes = React.useMemo(() => calculateChildrenToShow(typeToShow), [typeToShow]);
  const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;
  return (
    <Box pos="relative">
      <Flex maxW="full">
        <Box maxW="full" flexGrow>
          <Box
            onClick={childNodes.length > 0 ? () => setExpanded(!isExpanded) : undefined}
            cursor={childNodes.length > 0 ? 'pointer' : undefined}
          >
            <Flex alignItems="center" my={2} maxW="full">
              {childNodes.length > 0 ? <Caret isExpanded={isExpanded} /> : null}

              <Flex alignItems="baseline" fontSize="base" flex={1}>
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

                {combiner !== null ? (
                  <Box ml={1} color="muted">
                    {combiner}
                  </Box>
                ) : null}
              </Flex>
              <Properties
                required={isPropertyRequired(schemaNode)}
                deprecated={isRegularNode(schemaNode) && schemaNode.deprecated}
                validations={isRegularNode(schemaNode) ? schemaNode.validations : {}}
              />
            </Flex>

            {typeof description === 'string' && description.length > 0 && (
              <Flex flex={1} my={2} fontSize="base">
                <Description value={description} />
              </Flex>
            )}
          </Box>

          <Validations
            validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}}
            hideExamples={hideExamples}
          />

          {isBrokenRef && (
            // TODO (JJ): Add mosaic tooltip showing ref error
            <Icon title={refNode!.error!} color="danger" icon={faExclamationTriangle} size="sm" />
          )}
        </Box>
        <Box>{renderRowAddon ? renderRowAddon({ schemaNode, nestingLevel }) : null}</Box>
      </Flex>
      {childNodes.length > 0 && isExpanded ? (
        <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />
      ) : null}
    </Box>
  );
};

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}

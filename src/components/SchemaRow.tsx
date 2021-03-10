import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  ReferenceNode,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Box, Flex, Icon, VStack } from '@stoplight/mosaic';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, SCHEMA_ROW_OFFSET } from '../consts';
import { useJSVOptionsContext } from '../contexts';
import { isCombiner } from '../guards/isCombiner';
import { calculateChildrenToShow, isFlattenableNode, isPropertyRequired } from '../tree';
import { Caret, Description, Divider, Format, getValidationsFromSchema, Property, Validations } from './shared';
import { Properties } from './shared/Properties';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const description = isRegularNode(schemaNode) ? schemaNode.annotations.description : null;

  const { defaultExpandedDepth, renderRowAddon } = useJSVOptionsContext();

  const [isExpanded, setExpanded] = React.useState<boolean>(
    !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
  );

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

  const childNodes = React.useMemo(() => calculateChildrenToShow(schemaNode), [schemaNode]);

  return (
    <Box fontSize="sm" pos="relative" style={{ marginLeft: CARET_ICON_BOX_DIMENSION }}>
      <Flex>
        <Box flexGrow className="min-w-0">
          <Box
            onClick={childNodes.length > 0 ? () => setExpanded(!isExpanded) : undefined}
            cursor={childNodes.length > 0 ? 'pointer' : 'default'}
          >
            <Flex my={2}>
              {childNodes.length > 0 ? (
                <Caret
                  isExpanded={isExpanded}
                  style={{
                    width: CARET_ICON_BOX_DIMENSION,
                    height: CARET_ICON_BOX_DIMENSION,
                    ...(!isBrokenRef && nestingLevel === 0
                      ? {
                          position: 'relative',
                        }
                      : {
                          left: CARET_ICON_BOX_DIMENSION * -1 + SCHEMA_ROW_OFFSET / -2,
                        }),
                  }}
                  size={CARET_ICON_SIZE}
                />
              ) : null}

              {schemaNode.subpath.length > 0 &&
                isCombiner(schemaNode.subpath[0]) &&
                schemaNode.parent?.children?.indexOf(schemaNode as any) !== 0 && (
                  <Divider kind={schemaNode.subpath[0]} />
                )}

              <Flex flex={1} textOverflow="truncate" fontSize="base">
                <Property schemaNode={schemaNode} />
                <Format schemaNode={schemaNode} />
              </Flex>
              <Properties
                required={isPropertyRequired(schemaNode)}
                deprecated={isRegularNode(schemaNode) && schemaNode.deprecated}
                validations={isRegularNode(schemaNode) ? schemaNode.validations : {}}
              />
            </Flex>

            {typeof description === 'string' && description.length > 0 && (
              <Flex flex={1} my={2} py="px" textOverflow="truncate">
                <Description value={description} />
              </Flex>
            )}
          </Box>

          <Validations validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}} />

          {isBrokenRef && (
            // TODO (JJ): Add mosaic tooltip showing ref error
            <Icon title={refNode!.error!} color="danger" icon={faExclamationTriangle} size="sm" />
          )}
        </Box>
        <Box>{renderRowAddon ? renderRowAddon({ schemaNode, nestingLevel }) : null}</Box>
      </Flex>
      {childNodes.length > 0 && isExpanded ? (
        <VStack divider>
          {childNodes.map((childNode: SchemaNode) => (
            <SchemaRow key={childNode.id} schemaNode={childNode} nestingLevel={nestingLevel + 1} />
          ))}
        </VStack>
      ) : null}
    </Box>
  );
};

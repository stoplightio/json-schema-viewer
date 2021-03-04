import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { isMirroredNode, isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { Box, Flex, Icon, VStack } from '@stoplight/mosaic';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, SCHEMA_ROW_OFFSET } from '../consts';
import { IncreaseNestingLevel, SchemaNodeContext, useCurrentNestingLevel, useJSVOptionsContext } from '../contexts';
import { isCombiner } from '../guards/isCombiner';
import { useSchemaNode } from '../hooks';
import { calculateChildrenToShow, isPropertyRequired } from '../tree';
import { Caret, Description, Divider, Format, getValidationsFromSchema, Property, Validations } from './shared';
import { Properties } from './shared/Properties';

export interface ISchemaRow {
  schemaNode: SchemaNode;
}

export const SchemaPropertyRow: React.FunctionComponent = () => {
  const schemaNode = useSchemaNode();
  const description = isRegularNode(schemaNode) ? schemaNode.annotations.description : null;

  const currentNestingLevel = useCurrentNestingLevel();
  const { defaultExpandedDepth } = useJSVOptionsContext();

  const [isExpanded, setExpanded] = React.useState<boolean>(
    !isMirroredNode(schemaNode) && currentNestingLevel < defaultExpandedDepth,
  );

  // const refNode = React.useMemo<ReferenceNode | null>(() => {
  //   if (isReferenceNode(schemaNode)) {
  //     return schemaNode;
  //   }
  //
  //   if (
  //     isRegularNode(schemaNode) &&
  //     (tree.isFlattenedNode(schemaNode) ||
  //       (schemaNode.primaryType === SchemaNodeKind.Array && schemaNode.children?.length === 1))
  //   ) {
  //     return (schemaNode.children?.find(isReferenceNode) as Optional<ReferenceNode>) ?? null;
  //   }
  //
  //   return null;
  // }, [schemaNode, tree]);
  //
  // const isBrokenRef = typeof refNode?.error === 'string';
  const isBrokenRef = false;

  const childNodes = React.useMemo(() => calculateChildrenToShow(schemaNode), [schemaNode]);

  return (
    <>
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
                ...(!isBrokenRef && currentNestingLevel === 0
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
            schemaNode.parent?.children?.indexOf(schemaNode as any) !== 0 && <Divider kind={schemaNode.subpath[0]} />}

          <Flex flex={1} textOverflow="truncate" fontSize="base">
            <Property schemaNode={schemaNode} />
            <Format />
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
        // TODO (JJ): Add mosaic tooltip showing ref error /*refNode!.error!*/
        <Icon title={'Reference error'} color="danger" icon={faExclamationTriangle} size="sm" />
      )}
      {childNodes.length > 0 && isExpanded ? (
        <IncreaseNestingLevel>
          <VStack divider>
            {childNodes.map((childNode: SchemaNode) => (
              <SchemaRow key={childNode.id} schemaNode={childNode} />
            ))}
          </VStack>
        </IncreaseNestingLevel>
      ) : null}
    </>
  );
};
SchemaPropertyRow.displayName = 'JsonSchemaViewer.SchemaPropertyRow';

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ schemaNode }) => {
  const currentLevel = useCurrentNestingLevel();

  return (
    <SchemaNodeContext.Provider value={schemaNode}>
      <Box flex={1} px={2} w="full" maxW="full">
        <Box
          alignItems="center"
          pos="relative"
          fontSize="sm"
          style={{
            marginLeft: CARET_ICON_BOX_DIMENSION * currentLevel, // offset for spacing
          }}
        >
          <SchemaPropertyRow />
        </Box>
      </Box>
    </SchemaNodeContext.Provider>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

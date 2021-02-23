import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { isReferenceNode, isRegularNode, ReferenceNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { Box, Flex, Icon } from '@stoplight/mosaic';
import { IRowRendererOptions, isParentNode, Tree } from '@stoplight/tree-list';
import { Optional } from '@stoplight/types';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, SCHEMA_ROW_OFFSET } from '../consts';
import { SchemaNodeContext, TreeListNodeContext } from '../contexts';
import { isCombiner } from '../guards/isCombiner';
import { useSchemaNode, useSchemaTree, useTreeListNode } from '../hooks';
import { GoToRefHandler, SchemaTreeListNode } from '../types';
import { isPropertyRequired } from '../utils';
import { Caret, Description, Divider, getValidationsFromSchema, Property, Validations } from './shared';
import { Format } from './shared/Format';
import { Properties } from './shared/Properties';

export interface ISchemaRow {
  className?: string;
  treeListNode: SchemaTreeListNode;
  rowOptions: IRowRendererOptions;
  onGoToRef?: GoToRefHandler;
}

export const SchemaPropertyRow: React.FunctionComponent<Pick<ISchemaRow, 'rowOptions' | 'onGoToRef'>> = ({
  onGoToRef,
  rowOptions,
}) => {
  const schemaNode = useSchemaNode();
  const treeListNode = useTreeListNode();
  const tree = useSchemaTree();
  const description = isRegularNode(schemaNode) ? schemaNode.annotations.description : null;

  const refNode = React.useMemo<ReferenceNode | null>(() => {
    if (isReferenceNode(schemaNode)) {
      return schemaNode;
    }

    if (
      isRegularNode(schemaNode) &&
      (tree.isFlattenedNode(schemaNode) ||
        (schemaNode.primaryType === SchemaNodeKind.Array && schemaNode.children?.length === 1))
    ) {
      return (schemaNode.children?.find(isReferenceNode) as Optional<ReferenceNode>) ?? null;
    }

    return null;
  }, [schemaNode, tree]);

  const isBrokenRef = typeof refNode?.error === 'string';

  return (
    <>
      <Flex my={2}>
        {!isBrokenRef && isParentNode(treeListNode) && Tree.getLevel(treeListNode) > 0 ? (
          <Caret
            isExpanded={!!rowOptions.isExpanded}
            style={{
              width: CARET_ICON_BOX_DIMENSION,
              height: CARET_ICON_BOX_DIMENSION,
              ...(!isBrokenRef && Tree.getLevel(treeListNode) === 0
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
          <Property onGoToRef={onGoToRef} />
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

      <Validations validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}} />

      {isBrokenRef && (
        // TODO (JJ): Add mosaic tooltip showing ref error
        <Icon title={refNode!.error!} color="danger" icon={faExclamationTriangle} size="sm" />
      )}
      {!rowOptions.isExpanded && <Divider />}
    </>
  );
};
SchemaPropertyRow.displayName = 'JsonSchemaViewer.SchemaPropertyRow';

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ className, treeListNode, rowOptions, onGoToRef }) => {
  const schemaNode = treeListNode.metadata!.schemaNode;

  return (
    <SchemaNodeContext.Provider value={schemaNode}>
      <TreeListNodeContext.Provider value={treeListNode}>
        <Box flex={1} px={2} w="full" maxW="full" className={className}>
          <Box
            alignItems="center"
            pos="relative"
            fontSize="sm"
            style={{
              marginLeft: CARET_ICON_BOX_DIMENSION * Tree.getLevel(treeListNode), // offset for spacing
            }}
          >
            <SchemaPropertyRow onGoToRef={onGoToRef} rowOptions={rowOptions} />
          </Box>
        </Box>
      </TreeListNodeContext.Provider>
    </SchemaNodeContext.Provider>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

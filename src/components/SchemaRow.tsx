import { isReferenceNode, isRegularNode, ReferenceNode, SchemaNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { IRowRendererOptions, isParentNode, Tree } from '@stoplight/tree-list';
import { Optional } from '@stoplight/types';
import { Icon, Tooltip } from '@stoplight/ui-kit';
import cn from 'classnames';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, SCHEMA_ROW_OFFSET } from '../consts';
import { SchemaNodeContext, TreeListNodeContext } from '../contexts';
import { isCombiner } from '../guards/isCombiner';
import { useSchemaNode, useSchemaTree, useTreeListNode } from '../hooks';
import { GoToRefHandler, SchemaTreeListNode } from '../types';
import { isPropertyRequired } from '../utils/isPropertyRequired';
import { Caret, Description, Divider, Property, Validations } from './shared';
import { Format } from './shared/Format';

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

      <div className="flex-1 flex truncate">
        <Property onGoToRef={onGoToRef} />
        <Format />
        {typeof description === 'string' && description.length > 0 && <Description value={description} />}
      </div>

      <Validations
        required={isPropertyRequired(schemaNode)}
        deprecated={isRegularNode(schemaNode) && schemaNode.deprecated}
        validations={
          isRegularNode(schemaNode)
            ? {
                ...(schemaNode.enum !== null ? { enum: schemaNode.enum } : null),
                ...('annotations' in schemaNode && schemaNode.annotations.default
                  ? { default: schemaNode.annotations.default }
                  : null),
                ...schemaNode.validations,
              }
            : {}
        }
      />

      {isBrokenRef && (
        <Tooltip content={refNode!.error!}>
          <Icon className="text-red-5 dark:text-red-4" icon="warning-sign" iconSize={12} />
        </Tooltip>
      )}
    </>
  );
};
SchemaPropertyRow.displayName = 'JsonSchemaViewer.SchemaPropertyRow';

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ className, treeListNode, rowOptions, onGoToRef }) => {
  const schemaNode = treeListNode.metadata as SchemaNode;

  return (
    <SchemaNodeContext.Provider value={schemaNode}>
      <TreeListNodeContext.Provider value={treeListNode}>
        <div className={cn('px-2 flex-1 w-full max-w-full', className)}>
          <div
            className="flex items-center text-sm relative"
            style={{
              marginLeft: CARET_ICON_BOX_DIMENSION * Tree.getLevel(treeListNode), // offset for spacing
            }}
          >
            <SchemaPropertyRow onGoToRef={onGoToRef} rowOptions={rowOptions} />
          </div>
        </div>
      </TreeListNodeContext.Provider>
    </SchemaNodeContext.Provider>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

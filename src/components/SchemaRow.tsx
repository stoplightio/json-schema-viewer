import { IRowRendererOptions, isParentNode, Tree } from '@stoplight/tree-list';
import cn from 'classnames';
import * as React from 'react';

import { getLinkedNode } from '../tree/metadata';
import { ErrorNode, RegularNode } from '../tree/walker/nodes';
import { GoToRefHandler, SchemaTreeListNode } from '../types';
import { SchemaNodeProviderContext } from './SchemaNodeProvider';
import { Caret, Description, Divider, Property, Validations } from './shared';
import { useSchemaNode } from '../hooks/useSchemaNode';

export interface ISchemaRow {
  className?: string;
  treeNode: SchemaTreeListNode;
  rowOptions: IRowRendererOptions;
  onGoToRef?: GoToRefHandler;
}

const ICON_SIZE = 12;
const ICON_DIMENSION = 20;
const ROW_OFFSET = 7;

export const SchemaPropertyRow: typeof SchemaRow = ({ treeNode, onGoToRef, rowOptions }) => {
  const schemaNode = useSchemaNode();
  const schemaParentNode = treeNode.parent !== null ? getLinkedNode(treeNode.parent) : null;
  const description = schemaNode instanceof RegularNode ? schemaNode.annotations.description : null;

  const has$Ref = false;
  // isRefNode(schemaNode) || (getPrimaryType(schemaNode) === SchemaNodeKind.Array && hasRefItems(schemaNode));

  return (
    <>
      {has$Ref || (isParentNode(treeNode) && Tree.getLevel(treeNode) > 0) ? (
        <Caret
          isExpanded={!!rowOptions.isExpanded}
          style={{
            width: ICON_DIMENSION,
            height: ICON_DIMENSION,
            ...(has$Ref && Tree.getLevel(treeNode) === 0
              ? {
                  position: 'relative',
                }
              : {
                  left: ICON_DIMENSION * -1 + ROW_OFFSET / -2,
                }),
          }}
          size={ICON_SIZE}
        />
      ) : null}

      {schemaParentNode instanceof RegularNode && schemaParentNode
        schemaNode.parent.children[0] !== schemaNode && <Divider kind={parentSchemaNode.combiner} />}

      <div className="flex-1 flex truncate">
        <Property onGoToRef={onGoToRef} />
        {description && <Description value={description} />}
      </div>

      <Validations
        required={isRequired(schemaNode)}
        validations={{
          ...('annotations' in schemaNode &&
            schemaNode.annotations.default && { default: schemaNode.annotations.default }),
          ...('validations' in schemaNode && schemaNode.validations),
        }}
      />
    </>
  );
};
SchemaPropertyRow.displayName = 'JsonSchemaViewer.SchemaPropertyRow';

export const SchemaErrorRow: React.FunctionComponent<{ message: string }> = ({ message }) => (
  <span className="text-red-5 dark:text-red-4">{message}</span>
);
SchemaErrorRow.displayName = 'JsonSchemaViewer.SchemaErrorRow';

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ className, treeNode, rowOptions, onGoToRef }) => {
  const schemaNode = getLinkedNode(treeNode);

  return (
    <SchemaNodeProviderContext.Provider value={schemaNode}>
      <div className={cn('px-2 flex-1 w-full max-w-full', className)}>
        <div
          className="flex items-center text-sm relative"
          style={{
            marginLeft: ICON_DIMENSION * Tree.getLevel(treeNode), // offset for spacing
          }}
        >
          {schemaNode instanceof ErrorNode ? (
            <SchemaErrorRow message={schemaNode.error} />
          ) : (
            <SchemaPropertyRow treeNode={treeNode} onGoToRef={onGoToRef} rowOptions={rowOptions} />
          )}
        </div>
      </div>
    </SchemaNodeProviderContext.Provider>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

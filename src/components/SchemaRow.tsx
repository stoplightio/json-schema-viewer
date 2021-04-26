import { IRowRendererOptions, isParentNode, Tree } from '@stoplight/tree-list';
import cn from 'classnames';
import * as React from 'react';

import { getNodeMetadata, getSchemaNodeMetadata } from '../tree/metadata';
import { GoToRefHandler, JSONSchema, SchemaKind, SchemaTreeListNode } from '../types';
import { getPrimaryType } from '../utils/getPrimaryType';
import { hasRefItems, isArrayNodeWithItems, isRefNode } from '../utils/guards';
import { Caret, Description, Divider, Format, Property, Validations } from './shared';

export interface ISchemaRow {
  className?: string;
  node: SchemaTreeListNode;
  rowOptions: IRowRendererOptions;
  onGoToRef?: GoToRefHandler;
}

const ICON_SIZE = 12;
const ICON_DIMENSION = 20;
const ROW_OFFSET = 7;

function getRelevantSchemaForRequireCheck(treeNode: SchemaTreeListNode): JSONSchema | JSONSchema[] | null {
  const metadata = getNodeMetadata(treeNode);
  if (!('schemaNode' in metadata)) return null;
  if (isArrayNodeWithItems(metadata.schemaNode)) {
    return metadata.schemaNode.items;
  }

  return metadata.schema;
}

function isRequired(treeNode: SchemaTreeListNode) {
  if (treeNode.parent === null) return false;
  try {
    const { path } = getSchemaNodeMetadata(treeNode);
    if (path.length === 0) {
      return false;
    }

    const schema = getRelevantSchemaForRequireCheck(treeNode.parent);

    return (
      schema !== null &&
      !Array.isArray(schema) &&
      getPrimaryType(schema) === SchemaKind.Object &&
      Array.isArray(schema.required) &&
      schema.required.includes(String(path[path.length - 1]))
    );
  } catch {
    return false;
  }
}

export const SchemaPropertyRow: typeof SchemaRow = ({ node, onGoToRef, rowOptions }) => {
  const metadata = getSchemaNodeMetadata(node);
  const { schemaNode } = metadata;

  const parentSchemaNode =
    (node.parent !== null && Tree.getLevel(node.parent) >= 0 && getSchemaNodeMetadata(node.parent)?.schemaNode) || null;
  const description = 'annotations' in schemaNode ? schemaNode.annotations.description : null;

  const has$Ref = isRefNode(schemaNode) || (getPrimaryType(schemaNode) === SchemaKind.Array && hasRefItems(schemaNode));

  return (
    <>
      {has$Ref || (isParentNode(node) && Tree.getLevel(node) > 0) ? (
        <Caret
          isExpanded={!!rowOptions.isExpanded}
          style={{
            width: ICON_DIMENSION,
            height: ICON_DIMENSION,
            ...(has$Ref && Tree.getLevel(node) === 0
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

      {node.parent !== null &&
        node.parent.children.length > 0 &&
        parentSchemaNode !== null &&
        'combiner' in parentSchemaNode &&
        node.parent.children[0] !== node && <Divider kind={parentSchemaNode.combiner} />}

      <div className="flex-1 flex truncate">
        <Property node={node} onGoToRef={onGoToRef} />
        {metadata.schema.type && typeof metadata.schema.format === 'string' && <Format schema={metadata.schema} />}
        {description && <Description value={description} />}
      </div>

      <Validations
        required={isRequired(node)}
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

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ className, node, rowOptions, onGoToRef }) => {
  const metadata = getNodeMetadata(node);

  return (
    <div className={cn('px-2 flex-1 w-full max-w-full', className)}>
      <div
        className="flex items-center text-sm relative"
        style={{
          marginLeft: ICON_DIMENSION * Tree.getLevel(node), // offset for spacing
        }}
      >
        {'schema' in metadata ? (
          <SchemaPropertyRow node={node} onGoToRef={onGoToRef} rowOptions={rowOptions} />
        ) : (
          <SchemaErrorRow message={metadata.error} />
        )}
      </div>
    </div>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

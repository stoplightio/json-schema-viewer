import { IRowRendererOptions, Tree } from '@stoplight/tree-list';
import cn from 'classnames';
import * as React from 'react';

import { metadataStore } from '../tree/metadata';
import { GoToRefHandler, SchemaTreeListNode } from '../types';
import { Caret, Description, Divider, Property, Validations } from './shared';

export interface ISchemaRow {
  className?: string;
  node: SchemaTreeListNode;
  rowOptions: IRowRendererOptions;
  onGoToRef?: GoToRefHandler;
}

const ICON_SIZE = 12;
const ICON_DIMENSION = 20;
const ROW_OFFSET = 7;

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ className, node, rowOptions, onGoToRef }) => {
  const metadata = metadataStore[node.id];
  if (!metadata) {
    throw new Error('Missing metadata');
  }

  const { path, schema: schemaNode } = metadata;

  const parentSchemaNode =
    node.parent === null || !(node.parent.id in metadataStore) ? null : metadataStore[node.parent.id].schema;
  const description = 'annotations' in schemaNode ? schemaNode.annotations.description : null;

  return (
    <div className={cn('px-2 flex-1 w-full', className)}>
      <div
        className="flex items-center text-sm relative"
        style={{
          marginLeft: ICON_DIMENSION * Tree.getLevel(node), // offset for spacing
        }}
      >
        {'children' in node && Tree.getLevel(node) > 0 && (
          <Caret
            isExpanded={!!rowOptions.isExpanded}
            style={{
              left: ICON_DIMENSION * -1 + ROW_OFFSET / -2,
              width: ICON_DIMENSION,
              height: ICON_DIMENSION,
            }}
            size={ICON_SIZE}
          />
        )}

        {node.parent !== null &&
          node.parent.children.length > 0 &&
          parentSchemaNode !== null &&
          'combiner' in parentSchemaNode &&
          node.parent.children[0] !== node && <Divider kind={parentSchemaNode.combiner} />}

        <div className="flex-1 flex truncate">
          <Property node={schemaNode} path={metadata.path} onGoToRef={onGoToRef} />
          {description && <Description value={description} />}
        </div>

        <Validations
          required={
            parentSchemaNode !== null &&
            'required' in parentSchemaNode &&
            Array.isArray(parentSchemaNode.required) &&
            parentSchemaNode.required.includes(String(path[path.length - 1]))
          }
          validations={{
            ...('annotations' in schemaNode &&
              schemaNode.annotations.default && { default: schemaNode.annotations.default }),
            ...('validations' in schemaNode && schemaNode.validations),
          }}
        />
      </div>
    </div>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

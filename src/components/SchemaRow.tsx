import { IRowRendererOptions } from '@stoplight/tree-list';
import cn from 'classnames';
import { get } from 'lodash';
import * as React from 'react';

import { GoToRefHandler, SchemaNodeWithMeta, SchemaTreeListNode } from '../types';
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
  const schemaNode = node.metadata as SchemaNodeWithMeta;
  const description = get(schemaNode, 'annotations.description');

  return (
    <div className={cn('px-2 flex-1 w-full', className)}>
      <div
        className="flex items-center text-sm relative"
        style={{
          marginLeft: ICON_DIMENSION * node.level, // offset for spacing
        }}
      >
        {node.canHaveChildren &&
          node.level > 0 && (
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

        {schemaNode.divider && <Divider>{schemaNode.divider}</Divider>}

        <div className="flex-1 flex truncate">
          <Property node={schemaNode} onGoToRef={onGoToRef} />
          {description && <Description value={description} />}
        </div>

        <Validations
          required={!!schemaNode.required}
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

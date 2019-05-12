import { IRowRendererOptions, ITreeListNode, TreeStore } from '@stoplight/tree-list';
import { Button, Colors, Icon } from '@stoplight/ui-kit';
import * as pluralize from 'pluralize';
import * as React from 'react';

import { IMasking, SchemaNodeWithMeta } from '../types';
import { formatRef, isCombiner, isRef } from '../utils';
import { Types } from './';

export interface ISchemaRow extends IMasking {
  node: ITreeListNode<object>;
  rowOptions: IRowRendererOptions;
  treeStore: TreeStore;
}

const ICON_SIZE = 12;

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ node, treeStore }) => {
  const schemaNode = node.metadata as SchemaNodeWithMeta;
  const { showDivider, name, $ref, subtype, required, inheritedFrom } = schemaNode;

  const handleButtonClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    treeStore.setActiveNode(node.id);
  }, []);

  const type = isRef(schemaNode) ? '$ref' : isCombiner(schemaNode) ? schemaNode.combiner : schemaNode.type;
  const description = 'annotations' in schemaNode && schemaNode.annotations.description;

  const validationCount = 'validations' in schemaNode ? Object.keys(schemaNode.validations).length : 0;

  const showCaretIcon = node.level > 0 && node.canHaveChildren ? true : false;

  const marginLeft = ICON_SIZE * node.level;

  return (
    <div className="flex-1 flex items-center" style={{ marginLeft: ICON_SIZE, marginRight: ICON_SIZE }}>
      <div
        className="flex flex-1 items-center text-sm leading-tight w-full h-full relative"
        style={{ marginLeft, marginRight: ICON_SIZE }}
      >
        {showCaretIcon && (
          <Button
            minimal
            small
            className="absolute"
            style={{ left: ICON_SIZE * -2 }}
            icon={
              <Icon
                iconSize={ICON_SIZE}
                icon={treeStore.isNodeExpanded(node) ? 'caret-down' : 'caret-right'}
                color={Colors.GRAY1}
              />
            }
          />
        )}

        {showDivider && (
          <div className="flex items-center w-full h-2 absolute" style={{ top: -16, left: -16 }}>
            <div className="font-bold text-darken-7 pr-2">OR</div>
            <div className="flex-1 bg-darken-5" style={{ height: 2 }} />
          </div>
        )}

        <div className="flex-1 truncate">
          <div className="flex items-baseline">
            {name && <span>{name}</span>}

            <Types className="ml-2" type={type} subtype={subtype}>
              {type === '$ref' ? `[${$ref}]` : null}
            </Types>

            {inheritedFrom && <span className="text-darken-7 ml-2">{`{${formatRef(inheritedFrom)}}`}</span>}
          </div>

          {description && <span className="text-darken-7 text-xs">{description}</span>}
        </div>

        {validationCount > 0 && (
          <div className="ml-2 text-darken-7 text-xs">
            {validationCount} {pluralize('validation', validationCount)}
          </div>
        )}

        {required && <div className="ml-2 font-semibold text-xs">required</div>}

        {node.canHaveChildren &&
          (validationCount || description) && (
            <Button
              small
              className="ml-2"
              id={`${node.id}-showMore`}
              icon={<Icon icon="info-sign" className="opacity-75" iconSize={ICON_SIZE} />}
              onClick={handleButtonClick}
            />
          )}
      </div>
    </div>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

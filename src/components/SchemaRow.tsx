import { IRowRendererOptions, ITreeListNode, TreeStore } from '@stoplight/tree-list';
import { Omit } from '@stoplight/types';
import { Button, Checkbox, Colors, Icon } from '@stoplight/ui-kit';
import * as cn from 'classnames';
import * as pluralize from 'pluralize';
import * as React from 'react';

import { IMasking, SchemaNodeWithMeta } from '../types';
import { formatRef, isCombiner, isRef, pathToString } from '../utils';
import { Divider, Types } from './';

export interface ISchemaRow extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'onSelect'>, IMasking {
  node: ITreeListNode<object>;
  rowOptions: IRowRendererOptions;
  onMaskEdit(node: SchemaNodeWithMeta): void;
  treeStore: TreeStore;
}

const ICON_SIZE = 12;

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({
  node,
  treeStore,
  canSelect,
  onSelect,
  onMaskEdit,
  selected,
}) => {
  const schemaNode = node.metadata as SchemaNodeWithMeta;
  const { showDivider, name, $ref, subtype, required, path, inheritedFrom } = schemaNode;

  const handleChange = React.useCallback(
    () => {
      if (onSelect !== undefined) {
        onSelect(pathToString(path));
      }
    },
    [onSelect]
  );

  const handleEditMask = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.stopPropagation();
      onMaskEdit(schemaNode);
    },
    [onMaskEdit]
  );

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

        {showDivider && <Divider>or</Divider>}

        <div className="flex-1 truncate">
          <div className="flex items-baseline">
            {name && <span className="mr-3">{name}</span>}

            <Types type={type} subtype={subtype}>
              {type === '$ref' ? `[${$ref}]` : null}
            </Types>

            {inheritedFrom ? (
              <>
                <span className="text-darken-7 mx-2">{`{${formatRef(inheritedFrom)}}`}</span>
                {onMaskEdit !== undefined && <span onClick={handleEditMask}>(edit mask)</span>}
              </>
            ) : null}
          </div>

          {description && <span className="text-darken-7 text-xs">{description}</span>}
        </div>

        {(canSelect || validationCount || required) && (
          <div className="items-center text-right ml-auto text-xs">
            {canSelect ? (
              <Checkbox onChange={handleChange} checked={selected && selected.includes(pathToString(path))} />
            ) : (
              <>
                {validationCount ? (
                  <span className="mr-2 text-darken-7">
                    {validationCount} {pluralize('validation', validationCount)}
                  </span>
                ) : null}

                {required && <span className="font-semibold">required</span>}
              </>
            )}
          </div>
        )}

        {(validationCount || description) &&
          node.canHaveChildren && (
            <Button
              small
              className={cn(required && 'ml-2')}
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

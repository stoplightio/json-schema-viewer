import { MarkdownViewer } from '@stoplight/markdown-viewer';
import { IRowRendererOptions } from '@stoplight/tree-list';
import { Icon, Popover } from '@stoplight/ui-kit';
import * as cn from 'classnames';
import * as React from 'react';
import { ReactElement } from 'react';

import get = require('lodash/get');
import map = require('lodash/map');
import size = require('lodash/size');

import { GoToRefHandler, SchemaNodeWithMeta, SchemaTreeListNode } from '../types';
import { isCombiner, isRef } from '../utils';
import { Types } from './';

export interface ISchemaRow {
  node: SchemaTreeListNode;
  rowOptions: IRowRendererOptions;
  onGoToRef?: GoToRefHandler;
  maskControls?: () => ReactElement;
  toggleExpand: () => void;
}

const ICON_SIZE = 12;
const ICON_DIMENSION = 20;
const ROW_OFFSET = 7;

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({
  node,
  rowOptions,
  onGoToRef,
  maskControls,
  toggleExpand,
}) => {
  const schemaNode = node.metadata as SchemaNodeWithMeta;
  const { name, $ref, subtype, required } = schemaNode;

  const type = isRef(schemaNode) ? '$ref' : isCombiner(schemaNode) ? schemaNode.combiner : schemaNode.type;
  const description = get(schemaNode, 'annotations.description');
  const childrenCount =
    type === 'object'
      ? size(get(schemaNode, 'properties'))
      : subtype === 'object'
        ? size(get(schemaNode, 'items.properties'))
        : size(get(schemaNode, 'items'));

  const nodeValidations = {
    ...('annotations' in schemaNode && schemaNode.annotations.default
      ? { default: schemaNode.annotations.default }
      : {}),
    ...get(schemaNode, 'validations', {}),
  };
  const validationCount = Object.keys(nodeValidations).length;
  const handleGoToRef = React.useCallback<React.MouseEventHandler>(
    () => {
      if (onGoToRef) {
        onGoToRef($ref!, node);
      }
    },
    [onGoToRef, node, $ref],
  );

  const requiredElem = (
    <div className={cn('ml-2', required ? 'font-medium' : 'text-darken-7 dark:text-lighten-6')}>
      {required ? 'required' : 'optional'}
      {validationCount ? `+${validationCount}` : ''}
    </div>
  );

  return (
    <div onClick={toggleExpand} className="px-6 flex-1 w-full">
      <div
        className="flex items-center text-sm relative"
        style={{
          marginLeft: ICON_DIMENSION * node.level, // offset for spacing
        }}
      >
        {maskControls && maskControls()}

        {node.canHaveChildren &&
          node.level > 0 && (
            <div
              className="absolute flex justify-center cursor-pointer p-1 rounded hover:bg-darken-3"
              style={{
                left: ICON_DIMENSION * -1 + ROW_OFFSET / -2,
                width: ICON_DIMENSION,
                height: ICON_DIMENSION,
              }}
            >
              <Icon
                iconSize={ICON_SIZE}
                icon={rowOptions.isExpanded ? 'caret-down' : 'caret-right'}
                className="text-darken-9 dark:text-lighten-9"
              />
            </div>
          )}

        {schemaNode.divider && (
          <div className="flex items-center w-full absolute" style={{ top: maskControls ? -3 : -9, height: 1 }}>
            <div className="text-darken-7 dark:text-lighten-8 uppercase text-xs pr-2 -ml-4">{schemaNode.divider}</div>
            <div className="flex-1 bg-darken-5 dark:bg-lighten-5" style={{ height: 1 }} />
          </div>
        )}

        <div className="flex-1 flex truncate">
          {name && <div className="mr-2">{name}</div>}

          <Types type={type} subtype={subtype}>
            {type === '$ref' ? `[${$ref}]` : null}
          </Types>

          {type === '$ref' && onGoToRef ? (
            <a role="button" className="text-blue-4 ml-2" onClick={handleGoToRef}>
              (go to ref)
            </a>
          ) : null}

          {node.canHaveChildren && <div className="ml-2 text-darken-7 dark:text-lighten-7">{`{${childrenCount}}`}</div>}

          {'pattern' in schemaNode && schemaNode.pattern ? (
            <div className="ml-2 text-darken-7 dark:text-lighten-7 truncate">(pattern property)</div>
          ) : null}

          {description && (
            <Popover
              boundary="window"
              interactionKind="hover"
              className="ml-2 flex-1 truncate flex items-baseline"
              target={<div className="text-darken-7 dark:text-lighten-7 w-full truncate">{description}</div>}
              targetClassName="text-darken-7 dark:text-lighten-6 w-full truncate"
              content={
                <div className="p-5" style={{ maxHeight: 500, maxWidth: 400 }}>
                  <MarkdownViewer markdown={description} />
                </div>
              }
            />
          )}
        </div>

        {validationCount ? (
          <Popover
            boundary="window"
            interactionKind="hover"
            content={
              <div className="p-5" style={{ maxHeight: 500, maxWidth: 400 }}>
                {map(Object.keys(nodeValidations), (key, index) => {
                  const validation = nodeValidations[key];

                  let elem = null;
                  if (Array.isArray(validation)) {
                    elem = validation.map((v, i) => (
                      <div key={i} className="mt-1 mr-1 flex items-center">
                        <div className="px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded">{String(v)}</div>
                        {i < validation.length - 1 ? <div>,</div> : null}
                      </div>
                    ));
                  } else if (typeof validation === 'object') {
                    elem = (
                      <div className="m-1 px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded" key={index}>
                        {'{...}'}
                      </div>
                    );
                  } else {
                    elem = (
                      <div className="m-1 px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded" key={index}>
                        {JSON.stringify(validation)}
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="py-1 flex items-baseline">
                      <div className="font-medium pr-2 w-24">{key}:</div>
                      <div className="flex-1 flex flex-wrap text-center">{elem}</div>
                    </div>
                  );
                })}
              </div>
            }
            target={requiredElem}
          />
        ) : (
          requiredElem
        )}
      </div>
    </div>
  );
};
SchemaRow.displayName = 'JsonSchemaViewer.SchemaRow';

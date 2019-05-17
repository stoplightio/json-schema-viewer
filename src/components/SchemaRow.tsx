import { MarkdownViewer } from '@stoplight/markdown-viewer';
import { IRowRendererOptions, ITreeListNode, TreeStore } from '@stoplight/tree-list';
import { Colors, Icon, Popover } from '@stoplight/ui-kit';
import * as cn from 'classnames';
import * as React from 'react';

import get = require('lodash/get');
import map = require('lodash/map');
import size = require('lodash/size');

import { SchemaNodeWithMeta } from '../types';
import { isCombiner, isRef } from '../utils';
import { Types } from './';

export interface ISchemaRow {
  node: ITreeListNode<object>;
  rowOptions: IRowRendererOptions;
  treeStore: TreeStore;
}

const ICON_SIZE = 12;
const ICON_DIMENSION = 20;
const ROW_OFFSET = 7;

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({ node, treeStore }) => {
  const schemaNode = node.metadata as SchemaNodeWithMeta;
  const { name, $ref, subtype, required } = schemaNode;

  const type = isRef(schemaNode) ? '$ref' : isCombiner(schemaNode) ? schemaNode.combiner : schemaNode.type;
  const description = get(schemaNode, 'annotations.description');
  const childrenCount = size(get(schemaNode, 'properties'));

  const nodeValidations = {
    ...('annotations' in schemaNode && schemaNode.annotations.default
      ? { default: schemaNode.annotations.default }
      : {}),
    ...get(schemaNode, 'validations', {}),
  };
  const validationCount = Object.keys(nodeValidations).length;

  const requiredElem = (
    <span className={cn(required ? 'font-semibold' : 'text-darken-7')}>
      {required ? 'required' : 'optional'}
      {validationCount ? `+${validationCount}` : ''}
    </span>
  );

  return (
    <div className="flex-1 flex items-center" style={{ marginLeft: ROW_OFFSET, marginRight: ROW_OFFSET }}>
      <div
        className="flex flex-1 items-center text-sm leading-tight w-full h-full relative"
        style={{
          marginLeft: ICON_DIMENSION * node.level, // offset for spacing
        }}
      >
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
                icon={treeStore.isNodeExpanded(node) ? 'caret-down' : 'caret-right'}
                color={Colors.GRAY1}
              />
            </div>
          )}

        {schemaNode.divider && (
          <div className="flex items-center w-full absolute" style={{ top: -9, height: 1 }}>
            <div className="font-medium text-darken-7 pr-2 uppercase text-xs" style={{ marginLeft: -10 }}>
              {schemaNode.divider}
            </div>
            <div className="flex-1 bg-darken-5" style={{ height: 1 }} />
          </div>
        )}

        <div className="flex-1 truncate">
          <div className="flex items-baseline">
            {name && <span className="mr-2">{name}</span>}

            <Types type={type} subtype={subtype}>
              {type === '$ref' ? `[${$ref}]` : null}
            </Types>

            {node.canHaveChildren && <span className="ml-2 text-darken-7">{`{${childrenCount}}`}</span>}

            {'pattern' in schemaNode && schemaNode.pattern ? (
              <span className="text-darken-7 ml-2">(pattern property)</span>
            ) : null}

            {description && (
              <Popover
                boundary="window"
                interactionKind="hover"
                target={<span className="ml-2 text-darken-7">{description}</span>}
                content={
                  <div className="p-5" style={{ maxHeight: 500, maxWidth: 400 }}>
                    <MarkdownViewer markdown={description} />
                  </div>
                }
              />
            )}
          </div>
        </div>

        {validationCount ? (
          <Popover
            boundary="window"
            interactionKind="hover"
            content={
              <div className="p-3">
                {map(Object.keys(nodeValidations), (key, index) => {
                  const validation = nodeValidations[key];

                  let elem = [];
                  if (Array.isArray(validation)) {
                    elem = validation.map(v => (
                      <span key={v} className="px-1 bg-red-2 text-red-7 text-sm rounded">
                        {v}
                      </span>
                    ));
                  } else if (typeof validation === 'object') {
                    elem = [
                      <span key={index} className="px-1 bg-red-2 text-red-7 text-sm rounded">
                        {'{...}'}
                      </span>,
                    ];
                  } else {
                    elem = [
                      <span key={index} className="px-1 bg-red-2 text-red-7 text-sm rounded">
                        {JSON.stringify(validation)}
                      </span>,
                    ];
                  }

                  return (
                    <div key={index} className="py-1">
                      <span className="font-medium pr-2">{key}:</span>
                      <span className="px-1 bg-red-2 text-red-7 text-sm rounded">{elem}</span>
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

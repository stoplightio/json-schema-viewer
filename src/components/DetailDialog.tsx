import * as cn from 'classnames';
import _get = require('lodash/get');
import _isEmpty = require('lodash/isEmpty');
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { MarkdownViewer } from '@stoplight/markdown-viewer';
import { TreeStore } from '@stoplight/tree-list';
import { Dialog } from '@stoplight/ui-kit';

import { SchemaNodeWithMeta } from '../types';
import { isCombiner, isRef } from '../utils';
import { Types } from './';

export interface IDetailDialog extends React.HTMLAttributes<HTMLDivElement> {
  treeStore: TreeStore;
}

export const DetailDialog = observer<IDetailDialog>(({ treeStore }) => {
  const onClose = React.useCallback(() => treeStore.setActiveNode(''), []);

  if (!treeStore.activeNodeId) return null;

  const node = treeStore.nodes.find(n => n.id === treeStore.activeNodeId);
  if (!node) return null;

  const meta = node.metadata as SchemaNodeWithMeta;
  const { name, subtype, $ref, required } = meta;

  const type = isRef(meta) ? '$ref' : isCombiner(meta) ? meta.combiner : meta.type;
  const description = _get(meta, 'annotations.description', 'No further description.');

  const validations = 'validations' in meta && meta.validations ? meta.validations : [];
  const validationElems = [];
  for (const key in validations) {
    if (!validations[key]) continue;

    validationElems.push(
      <div key={key} className="flex py-1">
        <div className="flex-1">{key}:</div>
        <div className="pl-10">{validations[key] as any}</div>
      </div>
    );
  }

  return (
    <Dialog
      isOpen
      onClose={onClose}
      title={
        <div className="py-3">
          <div className="flex items-center text-base">
            {name && <span className="mr-3 te">{name}</span>}

            <Types type={type} subtype={subtype}>
              {type === '$ref' ? `[${$ref}]` : null}
            </Types>
          </div>

          <div className={cn('text-xs font-semibold', required ? 'text-red-6' : 'text-darken-7')}>
            {required ? 'REQUIRED' : 'OPTIONAL'}
          </div>
        </div>
      }
    >
      <div className="px-6 text-sm flex">
        {description && (
          <div className="flex-1">
            <MarkdownViewer className="mt-6" markdown={description} />
          </div>
        )}

        {!_isEmpty(validationElems) && <div className="mt-4 pl-4 border-l py-2">{validationElems}</div>}
      </div>
    </Dialog>
  );
});
DetailDialog.displayName = 'JsonSchemaViewer.DetailDialog';

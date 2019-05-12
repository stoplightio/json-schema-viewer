import { TreeList, TreeListEvents, TreeStore } from '@stoplight/tree-list';

import * as cn from 'classnames';
import { JSONSchema4 } from 'json-schema';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Dialog } from '@blueprintjs/core';
import { IMasking } from '../types';
import { DetailDialog, SchemaRow } from './';
import { JsonSchemaViewer } from './JsonSchemaViewer';

const ROW_HEIGHT = 40;
const canDrag = () => false;

export interface ISchemaTree extends IMasking {
  treeStore: TreeStore;
  schema: JSONSchema4;
  className?: string;
  name?: string;
  dereferencedSchema?: JSONSchema4;
  hideTopBar?: boolean;
  expanded?: boolean;
}

export const SchemaTree = observer<ISchemaTree>(props => {
  const { hideTopBar, selected, name, treeStore, className } = props;

  const [maskedSchema, setMaskedSchema] = React.useState<JSONSchema4 | null>(null);

  treeStore.on(TreeListEvents.NodeClick, (e, node) => {
    if (node.level === 0) return; // Don't allow collapsing the root

    if (node.canHaveChildren) {
      treeStore.toggleExpand(node);
    } else {
      treeStore.setActiveNode(node.id);
    }
  });

  const handleMaskedSchemaClose = React.useCallback(() => setMaskedSchema(null), []);

  const itemData = {
    selected,
    treeStore,
    count: treeStore.nodes.length,
  };

  const rowRenderer = React.useCallback(
    (node, rowOptions) => <SchemaRow node={node} rowOptions={rowOptions} {...itemData} />,
    [itemData]
  );

  return (
    <div className={cn(className, 'flex flex-col h-full w-full')}>
      {maskedSchema && (
        <Dialog isOpen onClose={handleMaskedSchemaClose}>
          <JsonSchemaViewer selected={selected} schema={maskedSchema} style={{ height: 500 }} />
        </Dialog>
      )}

      {name &&
        !hideTopBar && (
          <div className="flex items-center text-sm px-6 font-semibold" style={{ height: ROW_HEIGHT }}>
            {name}
          </div>
        )}

      <DetailDialog treeStore={treeStore} />

      <TreeList striped rowHeight={ROW_HEIGHT} canDrag={canDrag} store={treeStore} rowRenderer={rowRenderer} />
    </div>
  );
});
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

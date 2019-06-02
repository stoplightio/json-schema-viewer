import { TreeList, TreeListEvents, TreeStore } from '@stoplight/tree-list';
import * as cn from 'classnames';
import { JSONSchema4 } from 'json-schema';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { GoToRefHandler } from '../types';
import { SchemaRow } from './';

export interface ISchemaTree {
  treeStore: TreeStore;
  schema: JSONSchema4;
  className?: string;
  name?: string;
  dereferencedSchema?: JSONSchema4;
  hideTopBar?: boolean;
  expanded?: boolean;
  maxRows?: number;
  onGoToRef?: GoToRefHandler;
}

const canDrag = () => false;

export const SchemaTree = observer<ISchemaTree>(props => {
  const { hideTopBar, name, treeStore, maxRows, className, onGoToRef } = props;

  treeStore.on(TreeListEvents.NodeClick, (e, node) => treeStore.toggleExpand(node));

  const itemData = {
    treeStore,
    count: treeStore.nodes.length,
    onGoToRef,
  };

  const rowRenderer = React.useCallback(
    (node, rowOptions) => <SchemaRow node={node} rowOptions={rowOptions} {...itemData} />,
    [itemData.count],
  );

  return (
    <div className={cn(className, 'flex flex-col h-full w-full')}>
      {name &&
        !hideTopBar && (
          <div className="flex items-center text-sm px-2 font-semibold" style={{ height: 30 }}>
            {name}
          </div>
        )}

      <TreeList striped maxRows={maxRows} store={treeStore} rowRenderer={rowRenderer} canDrag={canDrag} />
    </div>
  );
});
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

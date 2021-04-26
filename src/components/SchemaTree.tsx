import { TreeList, TreeListEvents, TreeStore } from '@stoplight/tree-list';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { GoToRefHandler, JSONSchema, RowRenderer } from '../types';
import { SchemaRow } from './SchemaRow';

export interface ISchemaTree {
  treeStore: TreeStore;
  schema: JSONSchema;
  name?: string;
  hideTopBar?: boolean;
  expanded?: boolean;
  maxRows?: number;
  onGoToRef?: GoToRefHandler;
  rowRenderer?: RowRenderer;
}

const canDrag = () => false;

export const SchemaTree = observer<ISchemaTree>(props => {
  const { hideTopBar, name, treeStore, maxRows, onGoToRef, rowRenderer: customRowRenderer } = props;

  React.useEffect(() => {
    treeStore.events.on(TreeListEvents.NodeClick, (e, node) => {
      if ('children' in node) {
        treeStore.toggleExpand(node);
      }
    });

    return () => {
      treeStore.dispose();
    };
  }, [treeStore]);

  const rowRenderer = React.useCallback(
    (node, rowOptions) => {
      if (customRowRenderer !== undefined) {
        return customRowRenderer(node, rowOptions, treeStore);
      }

      return <SchemaRow node={node} rowOptions={rowOptions} onGoToRef={onGoToRef} />;
    },
    [onGoToRef, customRowRenderer, treeStore],
  );

  return (
    <>
      {name && !hideTopBar && (
        <div className="flex items-center text-sm px-2 font-semibold" style={{ height: 30 }}>
          {name}
        </div>
      )}

      <TreeList
        striped
        maxRows={maxRows !== undefined ? maxRows + 0.5 : maxRows}
        store={treeStore}
        rowRenderer={rowRenderer}
        canDrag={canDrag}
      />
    </>
  );
});
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

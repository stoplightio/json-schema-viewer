import { isParentNode, TreeList, TreeListEvents, TreeStore } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { GoToRefHandler, RowRenderer } from '../types';
import { SchemaRow } from './SchemaRow';

export interface ISchemaTree {
  treeStore: TreeStore;
  schema: JSONSchema4;
  expanded?: boolean;
  maxRows?: number;
  onGoToRef?: GoToRefHandler;
  rowRenderer?: RowRenderer;
}

export const SchemaTree: React.FC<ISchemaTree> = props => {
  const { treeStore, maxRows, onGoToRef, rowRenderer: customRowRenderer } = props;

  React.useEffect(() => {
    treeStore.events.on(TreeListEvents.NodeClick, (e, node) => {
      if (isParentNode(node)) {
        treeStore.toggleExpand(node);
      }
    });

    return () => {
      treeStore.dispose();
    };
  }, [treeStore]);

  const rowRenderer = React.useCallback(
    (node, rowOptions) => {
      if (customRowRenderer !== void 0) {
        return customRowRenderer(node, rowOptions, treeStore);
      }

      return <SchemaRow treeListNode={node} rowOptions={rowOptions} onGoToRef={onGoToRef} />;
    },
    [onGoToRef, customRowRenderer, treeStore],
  );

  return (
    <TreeList
      draggable={false}
      striped
      maxRows={maxRows !== void 0 ? maxRows + 0.5 : maxRows}
      store={treeStore}
      rowRenderer={rowRenderer}
    />
  );
};
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

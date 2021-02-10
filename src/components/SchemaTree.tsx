import { isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { isParentNode, TreeList, TreeListEvents, TreeListNode, TreeStore } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { GoToRefHandler, RowRenderer } from '../types';
import { SchemaRow } from './SchemaRow';
import { validationCount } from './shared/Validations';

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
      className="sl-flex-1"
      draggable={false}
      maxRows={maxRows !== void 0 ? maxRows + 0.5 : maxRows}
      store={treeStore}
      rowHeight={(node: TreeListNode<SchemaNode>) => {
        const padding = 8;
        const lineHeight = 18;
        let numberOfLines = 1;
        const schemaNode = node.metadata;

        if (schemaNode && isRegularNode(schemaNode)) {
          const hasDescription = schemaNode.annotations.description !== undefined;
          const validations = validationCount(schemaNode);
          numberOfLines += validations + (hasDescription ? 1 : 0);
        }
        return (numberOfLines + 1) * padding + numberOfLines * lineHeight;
      }}
      rowRenderer={rowRenderer}
    />
  );
};
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

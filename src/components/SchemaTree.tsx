import { TreeList, TreeStore } from '@stoplight/tree-list';
import * as cn from 'classnames';
import { JSONSchema4 } from 'json-schema';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { GoToRefHandler, IExtendableRenderers, SchemaTreeListNode } from '../types';
import { SchemaRow } from './';

export interface ISchemaTree extends IExtendableRenderers {
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

  const itemData = {
    treeStore,
    count: treeStore.nodes.length,
    onGoToRef,
  };

  // const rowRenderer = React.useCallback(
  //   (node, rowOptions) => {
  //     return (
  //       <SchemaRow
  //         toggleExpand={() => {
  //           treeStore.toggleExpand(node);
  //         }}
  //         rowRendererRight={props.rowRendererRight}
  //         node={node}
  //         rowOptions={rowOptions}
  //         {...itemData}
  //       />
  //     );
  //   },
  //   [itemData.count],
  // );

  return (
    <div className={cn(className, 'flex flex-col h-full w-full')}>
      {name &&
        !hideTopBar && (
          <div className="flex items-center text-sm px-2 font-semibold" style={{ height: 30 }}>
            {name}
          </div>
        )}

      <TreeList
        striped
        maxRows={maxRows !== undefined ? maxRows + 0.5 : maxRows}
        store={treeStore}
        rowRenderer={(node, rowOptions) => {
          return (
            <SchemaRow
              toggleExpand={() => {
                treeStore.toggleExpand(node);
              }}
              rowRendererRight={props.rowRendererRight}
              node={node as SchemaTreeListNode}
              rowOptions={rowOptions}
              {...itemData}
            />
          );
        }}
        canDrag={canDrag}
      />
      {props.schemaControlsRenderer && props.schemaControlsRenderer()}
    </div>
  );
});
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

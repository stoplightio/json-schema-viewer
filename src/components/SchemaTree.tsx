import { TreeList, TreeStore } from '@stoplight/tree-list';
import { Button } from '@stoplight/ui-kit';
import * as cn from 'classnames';
import { JSONSchema4 } from 'json-schema';
import { observer } from 'mobx-react-lite';
import { ReactElement } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { GoToRefHandler } from '../types';
import { SchemaRow } from './';
import MaskControls, { SelectedPaths } from './MaskControls';

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
  maskControlsHandler?: (attrs: SelectedPaths) => string[];
  updateMaskProp?: () => ReactElement;
  maskProps?: SelectedPaths;
}

const canDrag = () => false;

export const SchemaTree = observer<ISchemaTree>(props => {
  const { hideTopBar, name, treeStore, maxRows, className, onGoToRef } = props;

  const itemData = {
    treeStore,
    count: treeStore.nodes.length,
    onGoToRef,
  };

  const [selectedProps, setSelectedProps] = useState((props.maskProps || []) as Array<{
    path: string;
    required: any;
  }>);

  const rowRenderer = React.useCallback(
    (node, rowOptions) => {
      const possibleProps = props.maskControlsHandler
        ? {
            maskControls: () => (
              <MaskControls
                node={node}
                maskControlsHandler={props.maskControlsHandler}
                setSelectedProps={setSelectedProps}
                selectedProps={selectedProps}
              />
            ),
          }
        : {};

      return (
        <SchemaRow
          toggleExpand={() => {
            treeStore.toggleExpand(node);
          }}
          {...possibleProps}
          node={node}
          rowOptions={rowOptions}
          {...itemData}
        />
      );
    },
    [itemData.count, selectedProps],
  );

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
        rowRenderer={rowRenderer}
        canDrag={canDrag}
      />

      {props.maskControlsHandler && (
        <div className="pt-4 flex" style={{ alignSelf: 'flex-end', justifyContent: 'space-between' }}>
          {props.updateMaskProp && props.updateMaskProp()}

          <Button
            intent="none"
            title="clear selection"
            onClick={() => {
              setSelectedProps([]);

              if (props.maskControlsHandler) {
                props.maskControlsHandler([]);
              }
            }}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
});
SchemaTree.displayName = 'JsonSchemaViewer.SchemaTree';

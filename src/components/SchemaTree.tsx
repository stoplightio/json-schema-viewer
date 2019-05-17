import { TreeList, TreeListMouseEventHandler, TreeStore } from '@stoplight/tree-list';
import { Omit } from '@stoplight/types';
import { Box, IBox, ThemeZone } from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import { isEmpty as _isEmpty } from 'lodash';
import * as React from 'react';
import { useMetadata } from '../hooks';
import { useTheme } from '../theme';
import { IMasking, SchemaNodeWithMeta } from '../types';
import { lookupRef } from '../utils';
import { IJsonSchemaViewer } from './JsonSchemaViewer';
import { MaskedSchema } from './MaskedSchema';
import { ISchemaRow, SchemaRow } from './SchemaRow';
import { TopBar } from './TopBar';

const canDrag = () => false;

export interface ISchemaTree extends Omit<IBox, 'onSelect'>, IMasking {
  name?: string;
  dereferencedSchema?: JSONSchema4;
  schema: JSONSchema4;
  expanded?: boolean;
  hideTopBar?: boolean;
  treeStore: TreeStore;
}

export const SchemaTree: React.FunctionComponent<ISchemaTree> = props => {
  const {
    emptyText,
    expanded = false,
    schema,
    dereferencedSchema,
    hideTopBar,
    selected,
    canSelect,
    onSelect,
    name,
    treeStore,
    ...rest
  } = props;

  const theme = useTheme() as IJsonSchemaViewer;
  const [maskedSchema, setMaskedSchema] = React.useState<JSONSchema4 | null>(null);

  const metadata = useMetadata(schema);

  const handleMaskEdit = React.useCallback<ISchemaRow['onMaskEdit']>(
    node => {
      setMaskedSchema(lookupRef(node.path, dereferencedSchema));
    },
    [dereferencedSchema]
  );

  const handleNodeClick = React.useCallback<TreeListMouseEventHandler>(
    (e, node) => {
      treeStore.toggleExpand(node);
    },
    [treeStore]
  );

  const handleMaskedSchemaClose = React.useCallback(() => {
    setMaskedSchema(null);
  }, []);

  const shouldRenderTopBar = !hideTopBar && (name || !_isEmpty(metadata));

  const itemData = {
    onSelect,
    onMaskEdit: handleMaskEdit,
    selected,
    canSelect,
  };

  return (
    <Box backgroundColor={theme.canvas.bg} color={theme.canvas.fg} {...rest}>
      {maskedSchema && (
        <MaskedSchema onClose={handleMaskedSchemaClose} onSelect={onSelect} selected={selected} schema={maskedSchema} />
      )}
      {shouldRenderTopBar && <TopBar name={name} metadata={metadata} />}
      <ThemeZone name="tree-list">
        <TreeList
          top={shouldRenderTopBar ? '40px' : 0}
          rowHeight={40}
          canDrag={canDrag}
          store={treeStore}
          onNodeClick={handleNodeClick}
          rowRenderer={node => <SchemaRow node={node.metadata as SchemaNodeWithMeta} {...itemData} />}
        />
      </ThemeZone>
    </Box>
  );
};

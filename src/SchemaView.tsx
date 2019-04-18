import { TreeList, TreeStore } from '@stoplight/tree-list';
import { Omit } from '@stoplight/types';
import { Box, IBox, ThemeZone } from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { MaskedSchema } from './components/MaskedSchema';
import { IProperty, Property } from './components/Property';
import { TopBar } from './components/TopBar';
import { useMetadata } from './hooks/useMetadata';
import { IJsonSchemaViewer } from './JsonSchemaViewer';
import { useTheme } from './theme';
import { IMasking, SchemaNodeWithMeta } from './types';
import { lookupRef } from './utils/lookupRef';

const canDrag = () => false;

export interface ISchemaView extends Omit<IBox, 'onSelect'>, IMasking {
  name?: string;
  dereferencedSchema?: JSONSchema4;
  schema: JSONSchema4;
  expanded?: boolean;
  treeStore: TreeStore;
}

export const SchemaView: React.FunctionComponent<ISchemaView> = props => {
  const {
    emptyText,
    expanded = false,
    limitPropertyCount,
    schema,
    dereferencedSchema,
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

  const handleMaskEdit = React.useCallback<IProperty['onMaskEdit']>(node => {
    setMaskedSchema(lookupRef(node.path, dereferencedSchema));
  }, []);

  const handleMaskedSchemaClose = React.useCallback(() => {
    setMaskedSchema(null);
  }, []);

  const itemData = {
    onSelect,
    onMaskEdit: handleMaskEdit,
    selected,
    canSelect,
  };

  return (
    <Box backgroundColor={theme.canvas.bg} color={theme.canvas.fg} {...rest}>
      {maskedSchema && (
        <MaskedSchema
          onClose={handleMaskedSchemaClose}
          onSelect={onSelect}
          selected={selected}
          schema={maskedSchema}
          treeStore={treeStore}
        />
      )}
      <TopBar name={name} metadata={metadata} />
      <ThemeZone name="tree-list">
        <TreeList
          rowHeight={40}
          canDrag={canDrag}
          store={treeStore}
          rowRenderer={node => <Property node={node.metadata as SchemaNodeWithMeta} {...itemData} />}
        />
      </ThemeZone>
    </Box>
  );
};

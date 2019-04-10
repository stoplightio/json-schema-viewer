import { Dictionary, Omit } from '@stoplight/types';
import { Box, Button, IBox } from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import _get = require('lodash/get');
import * as React from 'react';
import { MutedText } from './components/common/MutedText';
import { MaskedSchema } from './components/MaskedSchema';
import { IProperty, Property } from './components/Property';
import { TopBar } from './components/TopBar';
import { useMetadata } from './hooks/useMetadata';
import { useProperties } from './hooks/useProperties';
import { useTheme } from './theme';
import { IMasking } from './types';
import { isExpanded } from './utils/isExpanded';
import { pathToString } from './utils/pathToString';

export interface ISchemaView extends Omit<IBox, 'onSelect'>, IMasking {
  name?: string;
  defaultExpandedDepth?: number;
  dereferencedSchema?: JSONSchema4;
  schema: JSONSchema4;
  limitPropertyCount?: number;
  expanded?: boolean;
  emptyText: string;
}

export const SchemaView: React.FunctionComponent<ISchemaView> = props => {
  const {
    defaultExpandedDepth = 1,
    emptyText,
    expanded = false,
    limitPropertyCount,
    schema,
    dereferencedSchema,
    selected,
    canSelect,
    onSelect,
    name,
    ...rest
  } = props;

  const theme = useTheme();
  const [showExtra, setShowExtra] = React.useState<boolean>(false);
  const [maskedSchema, setMaskedSchema] = React.useState<JSONSchema4 | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Dictionary<boolean>>({ all: expanded });
  const { properties, isOverflow } = useProperties(schema, dereferencedSchema, {
    expandedRows,
    defaultExpandedDepth,
    ...(!showExtra && { limitPropertyCount }),
    ...(canSelect && selected && { selected }),
  });
  const metadata = useMetadata(schema);

  const toggleExpandRow = React.useCallback<IProperty['onClick']>(
    node => {
      if (node.path.length > 0) {
        setExpandedRows({
          ...expandedRows,
          [pathToString(node)]: !isExpanded(node, defaultExpandedDepth, expandedRows),
        });
      }
    },
    [expandedRows, defaultExpandedDepth]
  );

  const toggleShowExtra = React.useCallback<React.MouseEventHandler<HTMLElement>>(
    () => {
      setShowExtra(!showExtra);
    },
    [showExtra]
  );

  const handleMaskEdit = React.useCallback<IProperty['onMaskEdit']>(node => {
    setMaskedSchema(_get(dereferencedSchema, node.path));
  }, []);

  const handleMaskedSchemaClose = React.useCallback(() => {
    setMaskedSchema(null);
  }, []);

  if (properties.length === 0) {
    return <MutedText>{emptyText}</MutedText>;
  }

  return (
    <Box backgroundColor={theme.canvas.bg} color={theme.canvas.fg} {...rest}>
      {maskedSchema && (
        <MaskedSchema onClose={handleMaskedSchemaClose} onSelect={onSelect} selected={selected} schema={maskedSchema} />
      )}
      <TopBar name={name} metadata={metadata} />
      {properties.map((node, i) => (
        <Property
          key={i}
          node={node}
          onClick={toggleExpandRow}
          onSelect={onSelect}
          onMaskEdit={handleMaskEdit}
          selected={selected}
          canSelect={canSelect}
        />
      ))}
      {showExtra || isOverflow ? (
        <Button onClick={toggleShowExtra}>{showExtra ? 'collapse' : `...show more properties`}</Button>
      ) : null}
    </Box>
  );
};

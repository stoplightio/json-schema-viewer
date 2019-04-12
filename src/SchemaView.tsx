import { Dictionary, Omit } from '@stoplight/types';
import { Box, Button, IBox } from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { MutedText } from './components/common/MutedText';
import { IProperty, Property } from './components/Property';
import { TopBar } from './components/TopBar';
import { useMetadata } from './hooks/useMetadata';
import { useProperties } from './hooks/useProperties';
import { useTheme } from './theme';
import { isExpanded } from './utils/isExpanded';
import { pathToString } from './utils/pathToString';

export interface ISchemaView extends Omit<IBox, 'onSelect'> {
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
    name,
    ...rest
  } = props;

  const theme = useTheme();
  const [showExtra, setShowExtra] = React.useState<boolean>(false);
  const [expandedRows, setExpandedRows] = React.useState<Dictionary<boolean>>({ all: expanded });
  const { properties, isOverflow } = useProperties(schema, dereferencedSchema, {
    expandedRows,
    defaultExpandedDepth,
    ...(!showExtra && { limitPropertyCount }),
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

  if (properties.length === 0) {
    return <MutedText>{emptyText}</MutedText>;
  }

  return (
    <Box backgroundColor={theme.canvas.bg} color={theme.canvas.fg} {...rest}>
      <TopBar name={name} metadata={metadata} />
      {properties.map((node, i) => (
        <Property key={i} node={node} onClick={toggleExpandRow} />
      ))}
      {showExtra || isOverflow ? (
        <Button onClick={toggleShowExtra}>{showExtra ? 'collapse' : `...show more properties`}</Button>
      ) : null}
    </Box>
  );
};

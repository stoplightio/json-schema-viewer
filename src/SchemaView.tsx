import { Dictionary } from '@stoplight/types';
import { Box, Button, IBox } from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { MutedText } from './common/MutedText';
import { Property } from './components/Property';
import { useProperties } from './hooks/useProperties';
import { useTheme } from './theme';
import { SchemaTreeNode } from './types';
import { isExpanded } from './utils/isExpanded';

export interface ISchemaView extends IBox {
  name?: string;
  defaultExpandedDepth?: number;
  dereferencedSchema?: JSONSchema4;
  schema: JSONSchema4;
  limitPropertyCount?: number;
  hideRoot?: boolean;
  expanded?: boolean;
  emptyText: string;
}

export const SchemaView: React.FunctionComponent<ISchemaView> = props => {
  const {
    defaultExpandedDepth = 1,
    emptyText,
    expanded = false,
    hideRoot,
    limitPropertyCount,
    schema,
    dereferencedSchema,
    originalSchema,
    ...rest
  } = props;

  const theme = useTheme();
  const [showExtra, setShowExtra] = React.useState<boolean>(false);
  const [expandedRows, setExpandedRows] = React.useState<Dictionary<boolean>>({ all: expanded });
  const { properties, isOverflow } = useProperties(schema, dereferencedSchema, {
    expandedRows,
    defaultExpandedDepth,
    limitPropertyCount,
  });

  const toggleExpandRow = React.useCallback<(node: SchemaTreeNode) => void>(
    node => {
      if (node.path.length > 0) {
        setExpandedRows({
          ...expandedRows,
          [node.path.join('.')]: !isExpanded(node, defaultExpandedDepth, expandedRows),
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
      {properties.map((node, i) => (
        <Property key={i} node={node} onClick={toggleExpandRow} />
      ))}
      {showExtra || isOverflow ? (
        <Button onClick={toggleShowExtra}>{showExtra ? 'collapse' : `...show more properties`}</Button>
      ) : null}
    </Box>
  );
};

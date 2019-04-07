import { Dictionary, ISchema } from '@stoplight/types';
import { Box, Button, IBox } from '@stoplight/ui-kit';
import dropRight = require('lodash/dropRight');
import * as React from 'react';
import { MutedText } from './common/MutedText';
import { renderSchema } from './renderers/renderSchema';
import { useTheme } from './theme';
import { buildAllOfSchema } from './util/buildAllOfSchema';

export interface ISchemaViewProps {
  name?: string;
  defaultExpandedDepth?: number;
  schemas: object;
  schema: ISchema;
  limitPropertyCount?: number;
  hideRoot?: boolean;
  expanded?: boolean;
  hideInheritedFrom?: boolean;
  emptyText: string;
}

export interface ISchemaView extends ISchemaViewProps, IBox {}

export const SchemaView: React.FunctionComponent<ISchemaView> = props => {
  const {
    defaultExpandedDepth = 1,
    emptyText,
    expanded = false,
    hideInheritedFrom = false,
    hideRoot,
    limitPropertyCount = 0,
    schema,
    schemas = {},
    ...rest
  } = props;

  const theme = useTheme();
  const [showExtra, setShowExtra] = React.useState<boolean>(false);
  const [expandedRows, setExpandedRows] = React.useState<Dictionary<boolean>>({ all: expanded });

  const toggleExpandRow = React.useCallback<(rowKey: string, expanded: boolean) => void>(
    (rowKey, expandRow) => {
      setExpandedRows({ ...expandedRows, [rowKey]: expandRow });
    },
    [expandedRows]
  );

  const toggleShowExtra = React.useCallback<React.MouseEventHandler<HTMLElement>>(
    () => {
      setShowExtra(!showExtra);
    },
    [showExtra]
  );

  let actualSchema = schema;

  if (
    !actualSchema ||
    !Object.keys(actualSchema).length ||
    (actualSchema.properties && !Object.keys(actualSchema.properties).length)
  ) {
    return <MutedText>{emptyText}</MutedText>;
  }

  if (actualSchema.allOf) {
    const schemaProps = actualSchema.allOf;

    if (actualSchema.type) schemaProps.push({ type: actualSchema.type });

    actualSchema = buildAllOfSchema(schemaProps);
  }

  let rowElems: React.ReactNodeArray = [];

  renderSchema({
    schemas,
    expandedRows,
    defaultExpandedDepth,
    schema: actualSchema,
    level: hideRoot && (actualSchema.type === 'object' || actualSchema.hasOwnProperty('allOf')) ? -1 : 0,
    name: 'root',
    rowElems,
    toggleExpandRow,
    hideInheritedFrom,
    jsonPath: 'root',
    hideRoot,
  });

  const propOverflowCount = rowElems.length - Math.max(0, limitPropertyCount);

  if (limitPropertyCount && !showExtra && propOverflowCount > 0) {
    rowElems = dropRight(rowElems, propOverflowCount);
  }

  if (rowElems.length === 0) {
    return <MutedText>{emptyText}</MutedText>;
  }

  return (
    <Box backgroundColor={theme.canvas.bg} color={theme.canvas.fg} {...rest}>
      {rowElems}
      {showExtra || (limitPropertyCount > 0 && propOverflowCount > 0) ? (
        <Button onClick={toggleShowExtra}>
          {showExtra ? 'collapse' : `...show ${propOverflowCount} more properties`}
        </Button>
      ) : null}
    </Box>
  );
};

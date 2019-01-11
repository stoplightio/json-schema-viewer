/* @jsx jsx */

import { jsx } from '@emotion/core';
import dropRight = require('lodash/dropRight');
import isEmpty = require('lodash/isEmpty');
import { Fragment, FunctionComponent, MouseEventHandler, ReactNodeArray, useCallback, useState } from 'react';

import { Dictionary, ISchema } from '@stoplight/types';
import { Button } from '@stoplight/ui-kit';
import { dereferenceSchema } from './dereferenceSchema';
import { renderSchema } from './renderers/renderSchema';
import { buildAllOfSchema } from './util/buildAllOfSchema';

export interface ISchemaView {
  name?: string;
  dereferencedSchema?: ISchema;
  defaultExpandedDepth?: number;
  schemas: object;
  schema: ISchema;
  limitPropertyCount?: number;
  hideRoot?: boolean;
  expanded?: boolean;
  hideInheritedFrom?: boolean;
}

export const SchemaView: FunctionComponent<ISchemaView> = props => {
  const {
    defaultExpandedDepth = 1,
    dereferencedSchema,
    expanded = false,
    hideInheritedFrom = false,
    hideRoot,
    limitPropertyCount = 0,
    schema,
    schemas = {},
  } = props;

  const [showExtra, setShowExtra] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Dictionary<boolean>>({ all: expanded });

  const toggleExpandRow = useCallback<(rowKey: string, expanded: boolean) => void>((rowKey, expandRow) => {
    setExpandedRows({ ...expandedRows, [rowKey]: expandRow });
  }, []);

  const toggleShowExtra = useCallback<MouseEventHandler<HTMLElement>>(() => {
    setShowExtra(!showExtra);
  }, []);

  let actualSchema: ISchema =
    !dereferencedSchema || isEmpty(dereferencedSchema)
      ? dereferenceSchema(schema, { definitions: schemas }, hideInheritedFrom)
      : dereferencedSchema;

  if (
    !actualSchema ||
    !Object.keys(actualSchema).length ||
    (actualSchema.properties && !Object.keys(actualSchema.properties).length)
  ) {
    return null;
  }

  if (actualSchema.allOf) {
    const props = actualSchema.allOf;

    if (actualSchema.type) props.push({ type: actualSchema.type });

    actualSchema = buildAllOfSchema(props);
  }

  let rowElems: ReactNodeArray = [];

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
    return null;
  }

  return (
    <Fragment>
      {rowElems}
      {showExtra || propOverflowCount > 0 ? (
        <Button onClick={toggleShowExtra}>
          {showExtra ? 'collapse' : `...show ${propOverflowCount} more properties`}
        </Button>
      ) : null}
    </Fragment>
  );
};

/* @jsx jsx */

import { jsx } from '@emotion/core';
import { safeParse } from '@stoplight/json';
import dropRight = require('lodash/dropRight');
import isEmpty = require('lodash/isEmpty');
import { Fragment, FunctionComponent, MouseEventHandler, ReactNodeArray, useCallback, useState } from 'react';

import { Dictionary, ISchema } from '@stoplight/types';
import { Button } from '@stoplight/ui-kit';
import { dereferenceSchema } from './dereferenceSchema';
import { renderSchema } from './renderers/renderSchema';
import { IProp } from './types';
import { buildAllOfSchema } from './util/buildAllOfSchema';

export interface ISchemaView {
  name?: string;
  dereferencedSchema?: string | ISchema;
  defaultExpandedDepth?: number;
  schemas: object;
  schema: string | ISchema;
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

  let parsedSchema: IProp;
  if (typeof (dereferencedSchema || schema) === 'string') {
    parsedSchema = safeParse((dereferencedSchema || schema) as string) as IProp;
  } else {
    parsedSchema = (dereferencedSchema || schema) as IProp;
  }

  if (!dereferencedSchema || isEmpty(dereferencedSchema)) {
    parsedSchema = dereferenceSchema(parsedSchema, { definitions: schemas }, hideInheritedFrom);
  }

  if (
    !parsedSchema ||
    !Object.keys(parsedSchema).length ||
    (parsedSchema.properties && !Object.keys(parsedSchema.properties).length)
  ) {
    return null;
  }

  if (parsedSchema.allOf) {
    const elems = parsedSchema.allOf;

    if (parsedSchema.type) elems.push({ type: parsedSchema.type });

    parsedSchema = buildAllOfSchema({ elems });
  }

  let rowElems: ReactNodeArray = [];

  renderSchema({
    schemas,
    expandedRows,
    defaultExpandedDepth,
    schema: parsedSchema,
    level: hideRoot && (parsedSchema.type === 'object' || parsedSchema.hasOwnProperty('allOf')) ? -1 : 0,
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

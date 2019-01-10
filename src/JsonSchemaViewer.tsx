import * as React from 'react';

import { safeParse } from '@stoplight/json';
import { Dictionary, ISchema } from '@stoplight/types';
import cn from 'classnames';
import * as _ from 'lodash';

import { dereferenceSchema } from './dereferenceSchema';
import { renderSchema } from './renderers/renderSchema';
import { IProp } from './types';
import { buildAllOfSchema } from './util/buildAllOfSchema';
import { isSchemaViewerEmpty } from './util/isSchemaViewerEmpty';

export interface IJsonSchemaViewer {
  name?: string;
  dereferencedSchema?: string | ISchema;
  defaultExpandedDepth?: number;
  schemas: object;
  schema: string | ISchema;
  limitPropertyCount: number;
  hideRoot?: boolean;
  expanded?: boolean;
  emptyText?: string;
  hideInheritedFrom?: boolean;
}

export interface IJsonSchemaViewerState {
  showExtra: boolean;
  expandedRows: Dictionary<boolean>;
}

export class JsonSchemaViewer extends React.Component<IJsonSchemaViewer, IJsonSchemaViewerState> {
  public state = {
    showExtra: false,
    expandedRows: {
      all: false,
    },
  };

  public render() {
    const {
      name,
      schema,
      dereferencedSchema,
      schemas = {},
      limitPropertyCount,
      hideRoot,
      expanded = false,
      defaultExpandedDepth = 1,
      emptyText,
      hideInheritedFrom = false,
    } = this.props;

    const emptyElem = <div className="u-none c-muted">{emptyText || 'No schema defined.'}</div>;

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return <div>{emptyElem}</div>;
    }

    let parsed: IProp;
    if (typeof (dereferencedSchema || schema) === 'string') {
      parsed = safeParse((dereferencedSchema || schema) as string) as IProp;
    } else {
      parsed = (dereferencedSchema || schema) as IProp;
    }

    try {
      if (!dereferencedSchema || _.isEmpty(dereferencedSchema)) {
        parsed = dereferenceSchema(parsed, { definitions: schemas }, hideInheritedFrom);
      }
    } catch (e) {
      console.error('JsonSchemaViewer dereference error', e);
      return <p className="u-error p-3">There is an error in your {name} schema definition.</p>;
    }

    if (!parsed || !Object.keys(parsed).length || (parsed.properties && !Object.keys(parsed.properties).length)) {
      return emptyElem;
    }

    let rowElems: any[];

    const { expandedRows } = this.state;
    expandedRows.all = expanded;

    try {
      // resolve root allOfs, simplifies things later
      if (parsed.allOf) {
        const elems = parsed.allOf;

        if (parsed.type) elems.push({ type: parsed.type });

        parsed = buildAllOfSchema({ elems });
      }

      rowElems = renderSchema({
        schemas,
        expandedRows,
        defaultExpandedDepth,
        schema: parsed,
        level: hideRoot && (parsed.type === 'object' || parsed.hasOwnProperty('allOf')) ? -1 : 0,
        name: 'root',
        rowElems: [],
        toggleExpandRow: this.toggleExpandRow,
        hideInheritedFrom,
        jsonPath: 'root',
        hideRoot,
      });
    } catch (e) {
      console.error('JSV:error', e);
      rowElems = [<div className="JSV-row u-error">{`Error rendering schema. ${e}`}</div>];
    }

    const { showExtra } = this.state;
    const propOverflowCount = rowElems.length - limitPropertyCount;

    if (limitPropertyCount) {
      if (!showExtra && propOverflowCount > 0) {
        rowElems = _.dropRight(rowElems, propOverflowCount);
      }
    }

    if (_.isEmpty(rowElems)) {
      return emptyElem;
    }

    return (
      <div className="JSV us-t u-schemaColors">
        {rowElems}

        {showExtra || propOverflowCount > 0 ? (
          <div className={cn('JSV-toggleExtra', { 'is-on': showExtra })} onClick={this.toggleShowExtra}>
            {showExtra ? 'collapse' : `...show ${propOverflowCount} more properties`}
          </div>
        ) : null}
      </div>
    );
  }

  public toggleShowExtra = () => {
    const { showExtra } = this.state;
    this.setState({ showExtra: !showExtra });
  };

  public toggleExpandRow = (rowKey: string, expanded: boolean) => {
    const { expandedRows } = this.state;
    const update = {};
    update[rowKey] = expanded;
    this.setState({ expandedRows: Object.assign({}, expandedRows, update) });
  };
}

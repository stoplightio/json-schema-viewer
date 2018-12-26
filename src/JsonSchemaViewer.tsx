import * as React from 'react';

import * as _ from 'lodash';

import { safeParse, safeStringify } from '@stoplight/json';
import { dereferenceSchema } from './dereferenceSchema';
import { isSchemaViewerEmpty } from './isSchemaViewerEmpty';

import { Textarea } from '@stoplight/ui-kit';

import { PropValidations } from './PropValidations';
import { getProps } from './util/getProps';
import { validationText } from './util/validationText';

const renderProp = ({
  schemas,
  level,
  parentName,
  rowElems,
  propName,
  prop,
  required,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  forApiDocs,
  hideInheritedFrom,
  jsonPath,
  hideRoot,
}) => {
  const position = rowElems.length;
  const name = propName;
  const rowKey = jsonPath;

  if (!prop) {
    rowElems.push(
      <div key={position} className={`text-negative py-2 JSV-row--${level}`}>
        Could not render prop. Is it valid? If it is a $ref, does the $ref exist?
      </div>
    );
    return rowElems;
  }

  let propType;
  let childPropType;
  let isBasic = false;
  let expandable = false;
  const expanded = _.has(expandedRows, rowKey)
    ? expandedRows[rowKey]
    : expandedRows.all || level <= defaultExpandedDepth;

  if (prop.items) {
    propType = prop.type;
    if (prop.items.allOf) {
      childPropType = 'object';
    } else if (prop.items.anyOf) {
      childPropType = 'anyOf';
    } else if (prop.items.oneOf) {
      childPropType = 'oneOf';
    } else if (prop.items.type) {
      childPropType = prop.items.type;
    }

    propType = prop.type;
    isBasic = true;

    if (
      prop.items.properties ||
      prop.items.patternProperties ||
      prop.items.allOf ||
      prop.items.oneOf ||
      prop.items.anyOf
    ) {
      expandable = true;
    }
  } else if (prop.oneOf) {
    propType = 'oneOf';
    expandable = !_.isEmpty(prop.oneOf);
  } else if (prop.anyOf) {
    propType = 'anyOf';
    expandable = !_.isEmpty(prop.anyOf);
  } else if (prop.allOf) {
    propType = 'object';
    expandable = !_.isEmpty(prop.allOf);
  } else {
    propType = prop.type;
    isBasic = prop.properties || prop.patternProperties || propType === 'object';

    if (prop.properties || prop.patternProperties) {
      expandable = true;
    }
  }

  if (jsonPath === 'root') expandable = false;

  let types = [];
  if (_.isString(propType)) {
    types = [propType];
  } else {
    types = propType;
  }

  let typeElems = [];
  if (!_.isEmpty(types)) {
    typeElems = types.reduce((acc, type, i) => {
      acc.push(
        <span key={i} className={`sl--${type}`}>
          {type === 'array' && childPropType && childPropType !== 'array' ? `array[${childPropType}]` : type}
        </span>
      );

      if (types[i + 1]) {
        acc.push(
          <span key={`${i}-sep`} className="c-muted">
            {' or '}
          </span>
        );
      }

      return acc;
    }, []);
  } else if (prop.$ref) {
    typeElems.push(
      <span key="prop-ref" className="sl--ref">
        {`{${prop.$ref}}`}
      </span>
    );
  } else if (prop.__error || isBasic) {
    typeElems.push(
      <span key="no-types" className="c-negative">
        {prop.__error || 'ERROR_NO_TYPE'}
      </span>
    );
  }

  let requiredElem;

  const vt = validationText(prop);
  const showVt = !expanded && vt;

  if (required || vt) {
    requiredElem = (
      <div>
        {showVt ? <span className="text-muted">{vt}</span> : null}
        {showVt && required ? <span className="text-muted"> + </span> : null}
        {required ? <span className="font-bold">required</span> : null}
      </div>
    );
  }

  const showInheritedFrom = !hideInheritedFrom && !_.isEmpty(prop.__inheritedFrom);

  if (!(hideRoot && jsonPath === 'root')) {
    rowElems.push(
      <div
        key={position}
        className={cn(`JSV-row JSV-row--${level} flex relative py-2`, {
          'cursor-pointer': vt || expandable,
          'is-expanded': expanded,
        })}
        onClick={() => {
          if (vt || expandable) {
            toggleExpandRow(rowKey, !expanded);
          }
        }}
      >
        {expandable ? <div className="JSV-rowExpander w-4 -ml-6 flex justify-center mt-1">{expanded} /></div> : null}

        <div className="flex-1">
          <div className="flex items-baseline">
            {name && name !== 'root' ? <div className="mr-3">{name}</div> : null}

            {!_.isEmpty(typeElems) && (
              <div
                className={cn('JSV-rowType', {
                  'JSV-namelessType': !name,
                })}
              >
                {typeElems}
              </div>
            )}
          </div>

          {!_.isEmpty(prop.description) ? <Textarea className="text-muted text-sm" value={prop.description} /> : null}
        </div>

        {requiredElem || showInheritedFrom || expanded ? (
          <div className="text-right text-sm pr-3 max-w-sm">
            {requiredElem}

            {showInheritedFrom ? <div className="text-muted">{`$ref:${prop.__inheritedFrom.name}`}</div> : null}

            {expanded && <PropValidations className="text-muted" prop={prop} />}
          </div>
        ) : null}
      </div>
    );
  }

  const properties = getProps({ parsed: prop });
  const requiredElems = prop.items ? prop.items.required : prop.required;
  const commonProps = {
    schemas,
    rowElems,
    toggleExpandRow,
    expandedRows,
    defaultExpandedDepth,
    forApiDocs,
    parentName: name,
    props: properties,
    hideInheritedFrom,
    jsonPath,
    required: requiredElems || [],
  };

  if (expanded || jsonPath === 'root') {
    if (properties && Object.keys(properties).length) {
      rowElems = renderProps({
        ...commonProps,
        props: properties,
        level: level + 1,
      });
    } else if (prop.items) {
      if (prop.items.allOf) {
        rowElems = renderAllOf({
          ...commonProps,
          props: prop.items.allOf,
          level,
        });
      } else if (prop.items.oneOf) {
        rowElems = renderCombiner({
          ...commonProps,
          props: prop.items.oneOf,
          level: level + 1,
          defaultType: prop.items.type,
        });
      } else if (prop.items.anyOf) {
        rowElems = renderCombiner({
          ...commonProps,
          props: prop.items.anyOf,
          level: level + 1,
          defaultType: prop.items.type,
        });
      }
    } else if (prop.allOf) {
      rowElems = renderAllOf({
        ...commonProps,
        props: prop.allOf,
        level,
      });
    } else if (prop.oneOf) {
      rowElems = renderCombiner({
        ...commonProps,
        props: prop.oneOf,
        level: level + 1,
        defaultType: prop.type,
      });
    } else if (prop.anyOf) {
      rowElems = renderCombiner({
        ...commonProps,
        props: prop.anyOf,
        level: level + 1,
        defaultType: prop.type,
      });
    }
  }

  return rowElems;
};

const renderProps = ({
  schemas,
  level,
  parentName,
  rowElems,
  props,
  required,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  forApiDocs,
  hideInheritedFrom,
  jsonPath,
}) => {
  for (const h in props) {
    if (!Object.prototype.hasOwnProperty.call(props, h)) {
      continue;
    }

    rowElems = renderProp({
      schemas,
      level,
      parentName,
      rowElems,
      toggleExpandRow,
      expandedRows,
      defaultExpandedDepth,
      forApiDocs,
      propName: h,
      prop: props[h],
      required: _.includes(required, h),
      hideInheritedFrom,
      jsonPath: `${jsonPath}.${h}`,
    });
  }
  return rowElems;
};

const renderRowDivider = ({ key, level, text }) => {
  return (
    <div key={`${key}-d`} className={`JSV-divider--${level} h-10 flex items-center`}>
      <div className="c-muted pr-3 uppercase text-sm">{text}</div>
      <div className="h-px bg-grey-light flex-1 mr-4" />
    </div>
  );
};

const buildAllOfSchema = ({ elems, schema = {} }) => {
  for (const e in elems) {
    if (!Object.prototype.hasOwnProperty.call(elems, e)) {
      continue;
    }

    const targetElems = elems[e];

    // nested allOf, for example, allOf -> $ref -> allOf
    if (elems[e].allOf) {
      buildAllOfSchema({ elems: targetElems.allOf, schema });
    } else {
      for (const key in targetElems) {
        if (_.isArray(targetElems[key])) {
          schema[key] = _.union(schema[key], targetElems[key]);
        } else if (typeof targetElems[key] === 'object') {
          schema[key] = _.merge(schema[key], targetElems[key]);
        } else {
          schema[key] = targetElems[key];
        }
      }
    }
  }

  return schema;
};

const renderAllOf = ({
  schemas,
  level,
  parentName,
  rowElems,
  props,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  forApiDocs,
  hideInheritedFrom,
  jsonPath,
}) => {
  const schema = buildAllOfSchema({ elems: props }) || {};

  rowElems = renderProps({
    schemas,
    props: schema.properties || {},
    required: schema.required || [],
    level: level + 1,
    rowElems,
    toggleExpandRow,
    expandedRows,
    defaultExpandedDepth,
    forApiDocs,
    hideInheritedFrom,
    jsonPath,
  });

  return rowElems;
};

const renderCombiner = ({
  schemas,
  level,
  parentName,
  defaultType,
  rowElems,
  props,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  forApiDocs,
  hideInheritedFrom,
  jsonPath,
}) => {
  for (const e in props) {
    if (!Object.prototype.hasOwnProperty.call(props, e)) {
      continue;
    }

    const elem = props[e];

    if (!_.has(elem, 'type') && defaultType) {
      _.set(elem, 'type', defaultType);
    }

    const key = `${parentName}-c-${level}-${e}`;

    const nextLevel = level === 0 && (elem.properties || elem.items) ? 1 : level;
    const commonProps = {
      schemas,
      parentName,
      rowElems,
      toggleExpandRow,
      expandedRows,
      defaultExpandedDepth,
      level: nextLevel,
      forApiDocs,
      hideInheritedFrom,
      jsonPath: `${jsonPath}.${e}`,
    };

    if (elem.properties) {
      if (!elem.type) {
        elem.type = 'object';
      }
      rowElems = renderProp({ ...commonProps, prop: elem });
    } else if (elem.items) {
      if (!elem.type) {
        elem.type = 'array';
      }
      rowElems = renderProp({ ...commonProps, prop: elem });
    } else {
      rowElems = renderSchema({
        ...commonProps,
        schema: elem,
        name: elem.properties || elem.items ? key : null,
      });
    }

    if (props[parseInt(e) + 1]) {
      rowElems.push(renderRowDivider({ key, level, text: 'or' }));
    }
  }

  return rowElems;
};

const renderSchema = ({
  schemas,
  schema,
  level,
  name,
  rowElems,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  forApiDocs,
  hideInheritedFrom,
  jsonPath,
  hideRoot,
}) => {
  let parsed = schema;

  if (!parsed) {
    return rowElems;
  }

  parsed = safeParse(parsed);
  if (_.isEmpty(parsed)) {
    return rowElems;
  }

  const nextLevel = level;
  const commonProps = {
    schemas,
    rowElems,
    toggleExpandRow,
    expandedRows,
    defaultExpandedDepth,
    forApiDocs,
    parentName: name,
    propName: name,
    required: _.includes(parsed.required || [], name),
    hideInheritedFrom,
    jsonPath,
    hideRoot,
  };

  if (parsed.properties) {
    const prop = {
      ...parsed,
      type: 'object',
      description: parsed.description,
    };

    if (!hideInheritedFrom && parsed.__inheritedFrom) {
      Object.assign(prop, _.pick(parsed, '__inheritedFrom'));
    }

    rowElems = renderProp({
      ...commonProps,
      level,
      prop,
    });
  } else if (parsed.items) {
    return renderProp({
      ...commonProps,
      level: nextLevel,
      prop: parsed,
    });
  } else if (parsed.allOf) {
    return renderAllOf({
      ...commonProps,
      level: nextLevel,
      props: parsed.allOf,
    });
  } else if (parsed.oneOf) {
    return renderCombiner({
      ...commonProps,
      level: nextLevel,
      props: parsed.oneOf,
      defaultType: parsed.type,
    });
  } else if (parsed.anyOf) {
    return renderCombiner({
      ...commonProps,
      level: nextLevel,
      props: parsed.anyOf,
      defaultType: parsed.type,
    });
  } else if (parsed.type) {
    return renderProp({
      ...commonProps,
      level: nextLevel,
      prop: parsed,
    });
  }

  return rowElems;
};

/*

  static propTypes = {
    name: PropTypes.string,
    schemas: PropTypes.object,
    schema: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    limitPropertyCount: PropTypes.number,
    hideRoot: PropTypes.bool,
    expanded: PropTypes.bool,

    emptyText: PropTypes.string,
    emptyClass: PropTypes.string,
  };
*/

export interface IJsonSchemaViewer {
  name: string;
  schemas: object;
  schema: string | object;
  limitPropertyCount: number;
  hideRoot: boolean;
  expanded: boolean;
  emptyText: string;
  emptyClass: string;
}

export class JsonSchemaViewer extends React.Component<IJsonSchemaViewer> {
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
      expanded,
      defaultExpandedDepth = 1,
      emptyText,
      emptyClass = '',
      forApiDocs,
      hideInheritedFrom,
    } = this.props;

    const emptyElem = <div className="u-none c-muted">{emptyText || 'No schema defined.'}</div>;

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return <div className={`${emptyClass}`}>{emptyElem}</div>;
    }

    let parsed = dereferencedSchema || schema;

    try {
      if (typeof parsed === 'string') {
        parsed = safeParse(parsed);
      }

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

    let rowElems;

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
        forApiDocs,
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
      rowElems = <div className="JSV-row u-error">{`Error rendering schema. ${e}`}</div>;
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
    this.setState({ showExtra: showExtra ? false : true });
  };

  public toggleExpandRow = (rowKey, expanded) => {
    const { expandedRows } = this.state;
    const update = {};
    update[rowKey] = expanded;
    this.setState({ expandedRows: Object.assign({}, expandedRows, update) });
  };
}

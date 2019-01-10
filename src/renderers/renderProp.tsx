import { Textarea } from '@stoplight/ui-kit';
import cn from 'classnames';
import * as _ from 'lodash';
import { ReactNode, ReactNodeArray } from 'react';
import * as React from 'react';
import { PropValidations } from '../PropValidations';
import { ICommonProps } from '../types';
import { getProps } from '../util/getProps';
import { validationText } from '../util/validationText';
import { renderAllOf } from './renderAllOf';
import { renderCombiner } from './renderCombiner';
import { renderProps } from './renderProps';

export interface IRenderProp extends ICommonProps {
  level: number;
}

export const renderProp = ({
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
  hideInheritedFrom,
  jsonPath,
  hideRoot,
}: IRenderProp) => {
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
  let childPropType: 'object' | 'anyOf' | 'oneOf' | 'array';
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
    isBasic = !!(prop.properties || prop.patternProperties || propType === 'object');

    if (prop.properties || prop.patternProperties) {
      expandable = true;
    }
  }

  if (jsonPath === 'root') expandable = false;

  let types: string[] = [];
  if (_.isString(propType)) {
    types = [propType];
  } else {
    types = propType;
  }

  let typeElems: ReactNodeArray = [];
  if (!_.isEmpty(types)) {
    typeElems = types.reduce((acc: ReactNode[], type: string, i) => {
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

            {expanded && <PropValidations prop={prop} />}
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
        ...(prop.type && { defaultType: prop.type }),
      });
    } else if (prop.anyOf) {
      rowElems = renderCombiner({
        ...commonProps,
        props: prop.anyOf,
        level: level + 1,
        ...(prop.type && { defaultType: prop.type }),
      });
    }
  }

  return rowElems;
};

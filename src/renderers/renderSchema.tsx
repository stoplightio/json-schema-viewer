import * as _ from 'lodash';

import { ICommonProps } from '../types';
import { renderAllOf } from './renderAllOf';
import { renderCombiner } from './renderCombiner';
import { renderProp } from './renderProp';

export interface IRenderSchemaProps extends ICommonProps {
  level: number;
  name?: string;
}

export const renderSchema = ({
  schemas,
  schema,
  level,
  name,
  rowElems,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  hideInheritedFrom,
  jsonPath,
  hideRoot,
}: IRenderSchemaProps) => {
  if (!schema || _.isEmpty(schema)) {
    return rowElems;
  }

  const nextLevel = level;
  const commonProps: ICommonProps = {
    schemas,
    rowElems,
    toggleExpandRow,
    expandedRows,
    defaultExpandedDepth,
    parentName: name,
    propName: name,
    required: _.includes(schema.required || [], name),
    hideInheritedFrom,
    jsonPath,
    hideRoot,
  };

  if (schema.properties) {
    const prop = {
      ...schema,
      type: 'object',
      description: schema.description,
    };

    if (!hideInheritedFrom && schema.__inheritedFrom) {
      Object.assign(prop, _.pick(schema, '__inheritedFrom'));
    }

    rowElems = renderProp({
      ...commonProps,
      level,
      prop,
    });
  } else if (schema.items) {
    return renderProp({
      ...commonProps,
      level: nextLevel,
      prop: schema,
    });
  } else if (schema.allOf) {
    return renderAllOf({
      ...commonProps,
      level: nextLevel,
      props: schema.allOf,
    });
  } else if (schema.oneOf) {
    return renderCombiner({
      ...commonProps,
      level: nextLevel,
      props: schema.oneOf,
      defaultType: schema.type,
    });
  } else if (schema.anyOf) {
    return renderCombiner({
      ...commonProps,
      level: nextLevel,
      props: schema.anyOf,
      defaultType: schema.type,
    });
  } else if (schema.type) {
    return renderProp({
      ...commonProps,
      level: nextLevel,
      prop: schema,
    });
  }

  return rowElems;
};

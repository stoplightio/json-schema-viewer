import { Dictionary, ISchema } from '@stoplight/types';
import { ICommonProps } from '../types';
import { buildAllOfSchema } from '../util/buildAllOfSchema';
import { renderProps } from './renderProps';

export interface IRenderAllProps extends ICommonProps {
  level: number;
  props: Dictionary<ISchema>;
}

export const renderAllOf = ({
  schemas,
  level,
  rowElems,
  props,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  hideInheritedFrom,
  jsonPath,
}: IRenderAllProps) => {
  const schema = buildAllOfSchema(props);

  return renderProps({
    schemas,
    props: schema.properties || {},
    required: schema.required || [],
    level: level + 1,
    rowElems,
    toggleExpandRow,
    expandedRows,
    defaultExpandedDepth,
    hideInheritedFrom,
    jsonPath,
  });
};

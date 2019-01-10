import { Dictionary } from '@stoplight/types';
import { ICommonProps, IProp } from '../types';
import { buildAllOfSchema } from '../util/buildAllOfSchema';
import { renderProps } from './renderProps';

export interface IRenderAllProps extends ICommonProps {
  level: number;
  props: Dictionary<IProp>;
}

export const renderAllOf = ({
  schemas,
  level,
  parentName,
  rowElems,
  props,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  hideInheritedFrom,
  jsonPath,
}: IRenderAllProps) => {
  const schema = buildAllOfSchema({ elems: props });

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

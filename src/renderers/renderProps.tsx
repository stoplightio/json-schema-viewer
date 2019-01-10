import { Dictionary } from '@stoplight/types';
import { ICommonProps, IProp } from '../types';
import { renderProp } from './renderProp';

export interface IRenderProps extends ICommonProps {
  level: number;
  props: Dictionary<IProp>;
  required: string[];
}

export const renderProps = ({
  schemas,
  level,
  parentName,
  rowElems,
  props,
  required,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  hideInheritedFrom,
  jsonPath,
}: IRenderProps) => {
  for (const [propName, propValue] of Object.entries(props)) {
    renderProp({
      schemas,
      level,
      parentName,
      rowElems,
      toggleExpandRow,
      expandedRows,
      defaultExpandedDepth,
      propName,
      prop: propValue,
      required: required !== undefined && required.includes(propName),
      hideInheritedFrom,
      jsonPath: `${jsonPath}.${propName}`,
    });
  }

  return rowElems;
};

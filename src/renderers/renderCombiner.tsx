import { Dictionary } from '@stoplight/types';
import has = require('lodash/has');
import set = require('lodash/set');
import { ICommonProps, IProp, IResolvedProp } from '../types';
import { renderProp } from './renderProp';
import { renderRowDivider } from './renderRowDivider';
import { renderSchema } from './renderSchema';

export interface IRenderCombinerProp extends ICommonProps {
  defaultType?: IProp['type'] | IResolvedProp['type'];
  props: Dictionary<IProp>;
  level: number;
}

export const renderCombiner = ({
  schemas,
  level,
  parentName,
  defaultType,
  rowElems,
  props,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  hideInheritedFrom,
  jsonPath,
}: IRenderCombinerProp) => {
  for (const [e, elem] of Object.entries(props)) {
    if (!has(elem, 'type') && defaultType) {
      set(elem, 'type', defaultType);
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
        ...((elem.properties || elem.items) !== undefined && { name: key }),
      });
    }

    if (props[parseInt(e) + 1]) {
      rowElems.push(renderRowDivider({ key, level, text: 'or' }));
    }
  }

  return rowElems;
};

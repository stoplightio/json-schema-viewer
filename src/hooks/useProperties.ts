import { JSONSchema4 } from 'json-schema';
import { useMemo } from 'react';
import { SchemaTreeNode } from '../types';
import { getProperties, IFilterOptions } from '../utils/getProperties';

export const useProperties = (schema: JSONSchema4, options: IFilterOptions) => {
  return useMemo(
    () => {
      let { limitPropertyCount } = options;
      const nodes: SchemaTreeNode[] = [];
      let isOverflow = false;

      for (const node of getProperties(schema, options)) {
        if (limitPropertyCount !== undefined && limitPropertyCount-- < 0) {
          isOverflow = true;
          break;
        }

        nodes.push(node);
      }

      return { isOverflow, properties: nodes };
    },
    [options.limitPropertyCount, options.defaultExpandedDepth, options.expandedRows]
  );
};

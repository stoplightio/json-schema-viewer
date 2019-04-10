import { Dictionary } from '@stoplight/types';
import { SchemaTreeNode } from '../types';
import { pathToString } from './pathToString';

export const isExpanded = (
  node: SchemaTreeNode,
  defaultExpandedDepth: number,
  expandedRows: Dictionary<boolean>
): boolean => {
  const path = pathToString(node);

  if (expandedRows.all === true) {
    return expandedRows[path] !== false;
  }

  return (!(path in expandedRows) && node.level <= defaultExpandedDepth) || expandedRows[path] === true;
};

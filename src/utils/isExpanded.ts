import { Dictionary } from '@stoplight/types';
import { SchemaTreeNode } from '../types';

export const isExpanded = (
  node: SchemaTreeNode,
  defaultExpandedDepth: number,
  expandedRows: Dictionary<boolean>
): boolean => {
  const path = node.path.join('.');

  if (expandedRows.all === true) {
    return expandedRows[path] !== false;
  }

  return (!(path in expandedRows) && node.level <= defaultExpandedDepth) || expandedRows[path] === true;
};

import { Dictionary } from '@stoplight/types';
import { SchemaTreeNode } from '../renderers/types';

export const isExpanded = (
  node: SchemaTreeNode,
  defaultExpandedDepth: number,
  expandedRows: Dictionary<boolean>
): boolean => {
  const path = node.path.join('');

  return (
    expandedRows.all === true ||
    (!(path in expandedRows) && node.level <= defaultExpandedDepth) ||
    expandedRows[path] === true
  );
};

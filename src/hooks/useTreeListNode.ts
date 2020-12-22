import { useContext } from 'react';

import { TreeListNodeContext } from '../contexts';

export function useTreeListNode() {
  return useContext(TreeListNodeContext);
}

import * as React from 'react';

import { SchemaTreeListTree, SchemaTreeState } from '../tree';

export const SchemaTreeContext = React.createContext<SchemaTreeListTree>(
  new SchemaTreeListTree({}, new SchemaTreeState(), {
    expandedDepth: 0,
    mergeAllOf: false,
    resolveRef: void 0,
    viewMode: 'standalone',
  }),
);

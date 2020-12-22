import { Tree } from '@stoplight/tree-list';
import * as React from 'react';

import { SchemaTreeListNode } from '../types';

export const TreeListNodeContext = React.createContext<SchemaTreeListNode>(Tree.createArtificialRoot());

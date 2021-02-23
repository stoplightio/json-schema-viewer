import * as React from 'react';

import { SchemaTreeListNode } from '../types';
import { SchemaTreeListTree } from '../tree';

export const TreeListNodeContext = React.createContext<SchemaTreeListNode>(SchemaTreeListTree.createArtificialRoot());

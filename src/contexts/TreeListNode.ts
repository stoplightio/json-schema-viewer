import * as React from 'react';

import { SchemaTreeListTree } from '../tree';
import { SchemaTreeListNode } from '../types';

export const TreeListNodeContext = React.createContext<SchemaTreeListNode>(SchemaTreeListTree.createArtificialRoot());

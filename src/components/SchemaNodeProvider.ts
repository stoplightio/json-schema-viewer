import * as React from 'react';
import { SchemaNode } from '../tree/walker/nodes/types';

export const SchemaNodeProviderContext = React.createContext<SchemaNode>({});

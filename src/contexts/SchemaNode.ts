import { RegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

export const SchemaNodeContext = React.createContext<SchemaNode>(new RegularNode({}));

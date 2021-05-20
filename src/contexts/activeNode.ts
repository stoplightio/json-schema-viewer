import { RegularNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

const ActiveNodeContext = React.createContext<RegularNode | null>(null);

export const useActiveNodeContext = () => React.useContext(ActiveNodeContext);

export const ActiveNodeContextProvider = ActiveNodeContext.Provider;

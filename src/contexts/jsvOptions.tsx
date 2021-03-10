import * as React from 'react';

import { ViewMode } from '../types';

type JSVOptions = {
  defaultExpandedDepth: number;
  viewMode: ViewMode;
};

const JSVOptionsContext = React.createContext<JSVOptions>({ defaultExpandedDepth: 0, viewMode: 'standalone' });

export const useJSVOptionsContext = () => React.useContext(JSVOptionsContext);

export const JSVOptionsContextProvider = JSVOptionsContext.Provider;

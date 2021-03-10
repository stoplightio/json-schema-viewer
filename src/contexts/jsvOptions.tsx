import * as React from 'react';

import { GoToRefHandler, ViewMode } from '../types';

export type JSVOptions = {
  defaultExpandedDepth: number;
  viewMode: ViewMode;
  onGoToRef?: GoToRefHandler;
};

const JSVOptionsContext = React.createContext<JSVOptions>({ defaultExpandedDepth: 0, viewMode: 'standalone' });

export const useJSVOptionsContext = () => React.useContext(JSVOptionsContext);

export const JSVOptionsContextProvider = JSVOptionsContext.Provider;

import type { NodeHasChangedFn } from '@stoplight/types';
import * as React from 'react';

import { GoToRefHandler, RowAddonRenderer, ViewMode } from '../types';

export type JSVOptions = {
  defaultExpandedDepth: number;
  viewMode: ViewMode;
  onGoToRef?: GoToRefHandler;
  renderRowAddon?: RowAddonRenderer;
  hideExamples?: boolean;
  renderRootTreeLines?: boolean;
  disableCrumbs?: boolean;
  nodeHasChanged?: NodeHasChangedFn<React.ReactNode>;
};

const JSVOptionsContext = React.createContext<JSVOptions>({
  defaultExpandedDepth: 0,
  viewMode: 'standalone',
  hideExamples: false,
});

export const useJSVOptionsContext = () => React.useContext(JSVOptionsContext);

export const JSVOptionsContextProvider = JSVOptionsContext.Provider;

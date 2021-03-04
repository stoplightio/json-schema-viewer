import * as React from 'react';

type JSVOptions = {
  defaultExpandedDepth: number;
  maxRows: number;
};

const JSVOptionsContext = React.createContext<JSVOptions>({ defaultExpandedDepth: 2, maxRows: Infinity });

export const useJSVOptionsContext = () => React.useContext(JSVOptionsContext);

export const JSVOptionsContextProvider = JSVOptionsContext.Provider;

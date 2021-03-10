import * as React from 'react';

type JSVOptions = {
  defaultExpandedDepth: number;
};

const JSVOptionsContext = React.createContext<JSVOptions>({ defaultExpandedDepth: 2 });

export const useJSVOptionsContext = () => React.useContext(JSVOptionsContext);

export const JSVOptionsContextProvider = JSVOptionsContext.Provider;

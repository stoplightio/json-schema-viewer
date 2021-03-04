import * as React from 'react';

const NestingLevelContext = React.createContext<number>(0);

export const useCurrentNestingLevel = () => React.useContext(NestingLevelContext);

export const IncreaseNestingLevel: React.FC = ({ children }) => {
  const currentLevel = useCurrentNestingLevel();

  return <NestingLevelContext.Provider value={currentLevel + 1}>{children}</NestingLevelContext.Provider>;
};

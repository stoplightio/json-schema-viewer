import { Box, Flex } from '@stoplight/ui-kit';
import * as React from 'react';
import { MutedText } from './common/MutedText';
import { useTheme } from '../theme';

export const Divider: React.FunctionComponent<{}> = ({ children }) => {
  const theme = useTheme();

  return (
    <Flex alignItems="center" position="absolute" top="-5px" height="10px" width="calc(100% - 15px)">
      <Box backgroundColor={theme.divider.bg} height="1px" minWidth="50px" width="20%" />
      <MutedText fontSize=".75rem" textTransform="uppercase" px={3}>
        {children}
      </MutedText>
      <Box backgroundColor={theme.divider.bg} height="1px" flex="1 1 0%" />
    </Flex>
  );
};

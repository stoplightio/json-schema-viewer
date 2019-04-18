import { Box, Flex, IFlex } from '@stoplight/ui-kit';
import * as React from 'react';
import { IJsonSchemaViewerTheme, useTheme } from '../theme';
import { MutedText } from './common/MutedText';

export const Divider: React.FunctionComponent<IFlex> = ({ children, ...props }) => {
  const theme = useTheme() as IJsonSchemaViewerTheme;

  return (
    <Flex alignItems="center" position="absolute" top="-16px" height="10px" {...props}>
      <MutedText fontSize=".8rem" textTransform="uppercase" fontWeight={700} pr={7}>
        {children}
      </MutedText>
      <Box backgroundColor={theme.divider.bg} height="2px" flex="1 1 0%" />
    </Flex>
  );
};

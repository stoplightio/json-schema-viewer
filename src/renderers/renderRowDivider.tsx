import { Box, Flex } from '@stoplight/ui-kit';
import * as React from 'react';
import { MutedText } from '../common/MutedText';
import { DEFAULT_PADDING, GUTTER_WIDTH } from '../consts';
import { useTheme } from '../theme';

interface IRowDivider {
  key: string;
  level: number;
  text: string;
}

export const renderRowDivider: React.FunctionComponent<IRowDivider> = ({ key, level, text }) => {
  const theme = useTheme();

  return (
    <Flex alignItems="center" key={`${key}-d`} height="2.5rem" pl={`${DEFAULT_PADDING + GUTTER_WIDTH * (level - 1)}px`}>
      <MutedText fontSize=".875rem" textTransform="uppercase" pr={3}>
        {text}
      </MutedText>
      <Box backgroundColor={theme.divider.bg} height="1px" mr={15} flex="1 1 0%" />
    </Flex>
  );
};

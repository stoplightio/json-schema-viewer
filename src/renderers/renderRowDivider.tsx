/* @jsx jsx */
import { jsx } from '@emotion/core';
import { Box, Flex } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';
import { MutedText } from '../common/MutedText';
import { DEFAULT_PADDING, GUTTER_WIDTH } from '../consts';
import { useTheme } from '../theme';

interface IRowDivider {
  key: string;
  level: number;
  text: string;
}

export const renderRowDivider: FunctionComponent<IRowDivider> = ({ key, level, text }) => {
  const theme = useTheme();

  return (
    <Flex alignItems="center" key={`${key}-d`} height="2.5rem" pl={DEFAULT_PADDING + GUTTER_WIDTH * (level - 1)}>
      <MutedText fontSize=".875rem" textTransform="uppercase" pr={11}>
        {text}
      </MutedText>
      <Box backgroundColor={theme.divider.bg} height="1px" mr={15} flex="1 1 0%" />
    </Flex>
  );
};

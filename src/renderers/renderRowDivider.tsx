/* @jsx jsx */
import { jsx } from '@emotion/core';
import { Box, Flex } from '@stoplight/ui-kit';
import { MutedText } from '../common/MutedText';

interface IRowDivider {
  key: string;
  level: number;
  text: string;
}

export const renderRowDivider = ({ key, level, text }: IRowDivider) => {
  return (
    <Flex alignItems="center" key={`${key}-d`} height="2.5rem" pl={5 * (level + 1)}>
      <MutedText fontSize=".875rem" textTransform="uppercase" pr={3}>
        {text}
      </MutedText>
      <Box backgroundColor="#dae1e7" height="1px" mr={4} flex="1 1 0%" />
    </Flex>
  );
};

/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';
import { useTheme } from '../theme';

export const MutedText: FunctionComponent<IMutedText> = props => {
  const { children, ...rest } = props;
  const css = mutedTextStyles();

  return (
    <Box css={css} {...rest}>
      {children}
    </Box>
  );
};

export interface IMutedTextProps {}

export interface IMutedText extends IMutedTextProps, IBox {}

export const mutedTextStyles = () => {
  const theme = useTheme();
  return {
    color: theme.canvas.muted,
  };
};

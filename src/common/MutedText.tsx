/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';

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
  // const theme = useTheme();
  return {
    // canvas.muted
    color: 'rgba(19, 15, 33, 0.6)',
  };
};

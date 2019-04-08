import { Box, IBox } from '@stoplight/ui-kit';
import * as React from 'react';
import { useTheme } from '../theme';

export const MutedText: React.FunctionComponent<IBox> = props => {
  const { children, ...rest } = props;
  const css = mutedTextStyles();

  return (
    <Box css={css} {...rest}>
      {children}
    </Box>
  );
};

export const mutedTextStyles = () => {
  const theme = useTheme();
  return {
    color: theme.canvas.muted,
  };
};

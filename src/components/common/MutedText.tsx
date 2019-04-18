import { Box, IBox } from '@stoplight/ui-kit';
import * as React from 'react';
import { IJsonSchemaViewerTheme, useTheme } from '../../theme';

export const MutedText: React.FunctionComponent<IBox> = props => {
  const { children, ...rest } = props;
  const theme = useTheme() as IJsonSchemaViewerTheme;

  const css = mutedTextStyles(theme);

  return (
    <Box css={css} {...rest}>
      {children}
    </Box>
  );
};

export const mutedTextStyles = (theme: IJsonSchemaViewerTheme) => {
  return {
    color: theme.canvas.muted,
  };
};

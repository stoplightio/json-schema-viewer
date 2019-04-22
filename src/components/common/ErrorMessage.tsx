import { Box, IBox } from '@stoplight/ui-kit';
import * as React from 'react';
import { IJsonSchemaViewerTheme, useTheme } from '../../theme';

export const ErrorMessage: React.FunctionComponent<IBox> = props => {
  const { children, ...rest } = props;
  const theme = useTheme() as IJsonSchemaViewerTheme;
  const css = errorMessageStyles(theme);

  return (
    <Box as="p" p={11} css={css} {...rest}>
      {children}
    </Box>
  );
};

export const errorMessageStyles = (theme: IJsonSchemaViewerTheme) => {
  return {
    color: theme.canvas.error,
  };
};

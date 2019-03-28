/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';
import { useTheme } from '../theme';

export const ErrorMessage: FunctionComponent<IErrorMessage> = props => {
  const { children, ...rest } = props;
  const css = errorMessageStyles();

  return (
    <Box as="p" p={11} css={css} {...rest}>
      {children}
    </Box>
  );
};

export interface IErrorMessageProps {}

export interface IErrorMessage extends IErrorMessageProps, IBox {}

export const errorMessageStyles = () => {
  const theme = useTheme();
  return {
    color: theme.canvas.error,
  };
};

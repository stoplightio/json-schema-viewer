/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';

export const ErrorMessage: FunctionComponent<IErrorMessage> = props => {
  const { children, ...rest } = props;
  const css = errorMessageStyles();

  return (
    <Box as="p" p={3} css={css} {...rest}>
      {children}
    </Box>
  );
};

export interface IErrorMessageProps {}

export interface IErrorMessage extends IErrorMessageProps, IBox {}

export const errorMessageStyles = () => {
  // const theme = useTheme();
  return {
    // canvas.error
    color: 'red',
  };
};

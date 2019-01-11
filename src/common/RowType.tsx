/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';

export const RowType: FunctionComponent<IRowType> = props => {
  const { children, name, ...rest } = props;
  const css = rowStyles({ name });

  return (
    <Box css={css} {...rest}>
      {children}
    </Box>
  );
};

export interface IRowTypeProps {
  name?: string;
}

export interface IRowType extends IRowTypeProps, IBox {}

export const rowStyles = ({ name }: IRowTypeProps) => {
  return {};
};

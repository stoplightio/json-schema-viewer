/* @jsx jsx */

import { css, jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';

export const Row: FunctionComponent<IRow> = props => {
  const { children, level, ...rest } = props;
  const styles = rowStyles({ level });

  return (
    <Box css={styles} {...rest}>
      {children}
    </Box>
  );
};

export interface IRowProps {
  level?: number;
}

export interface IRow extends IRowProps, IBox {}

const $gutterWidth = 15;

export const rowStyles = ({ level }: IRowProps) => {
  return [
    {
      ...(level !== undefined && { paddingLeft: 20 + $gutterWidth * level }),
    },
    css`
      user-select none;

      &:nth-child(even) {
        background-color grey;
      }

      &:hover {
       background-color #f3f3f3;
      }

      i {
        font-size 11px
      }
    `,
  ];
};

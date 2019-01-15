/* @jsx jsx */

import { css, jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { FunctionComponent } from 'react';
import { DEFAULT_PADDING, GUTTER_WIDTH } from '../consts';
import { useTheme } from '../theme';

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

export const rowStyles = ({ level }: IRowProps) => {
  const theme = useTheme();

  return [
    {
      ...(level !== undefined && { paddingLeft: DEFAULT_PADDING + GUTTER_WIDTH * level }),
    },
    css`
      user-select none;
      line-height: 1rem;

      &:nth-of-type(even) {
        background-color ${theme.row.evenBg};
        color ${theme.row.evenFg || theme.canvas.fg};
      }

      &:hover {
        background-color ${theme.row.hoverBg};
        color ${theme.row.hoverFg || theme.canvas.fg};
      }
    `,
  ];
};

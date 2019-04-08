import { Box, IBox, IBoxCSS } from '@stoplight/ui-kit';
import * as React from 'react';
import { useTheme } from '../theme';

export const RowType: React.FunctionComponent<IRowType> = props => {
  const { children, type, ...rest } = props;
  const css = rowStyles({ type });

  return (
    <Box css={css} {...rest}>
      {children}
    </Box>
  );
};

export interface IRowTypeProps {
  type?: string;
}

export interface IRowType extends IRowTypeProps, IBox {}

export const rowStyles = ({ type }: IRowTypeProps): IBoxCSS => {
  const theme = useTheme();

  return type !== undefined && type in theme.types && { color: theme.types[type] };
};

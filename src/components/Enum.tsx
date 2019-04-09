import { Box, IBox } from '@stoplight/ui-kit';
import * as React from 'react';
import { IBaseNode } from '../types';

export interface IEnum extends IBox {
  value: IBaseNode['enum'];
}

export const Enum: React.FunctionComponent<IEnum> = ({ value, ...props }) => {
  if (!value) return null;

  return (
    <Box as="span" {...props}>
      enum[{value.join(',')}]
    </Box>
  );
};

import { Box } from '@stoplight/mosaic';
import * as React from 'react';

type FormatProps = {
  format: string;
};

export const Format: React.FunctionComponent<FormatProps> = ({ format }) => {
  return <Box as="span" color="muted">{`<${format}>`}</Box>;
};

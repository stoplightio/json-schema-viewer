import { Box } from '@stoplight/mosaic';
import * as React from 'react';

export const Description: React.FunctionComponent<{ value: string }> = ({ value }) => (
  // TODO (JJ): Add mosaic popover showing full description in MarkdownViewer
  <Box title={value} textOverflow="truncate" w="full" color="muted">{value}</Box>
);

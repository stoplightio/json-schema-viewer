import { MarkdownViewer } from '@stoplight/markdown-viewer';
import { Box } from '@stoplight/mosaic';
import * as React from 'react';

export const Description: React.FunctionComponent<{ value: string }> = ({ value }) => (
  <Box
    as={MarkdownViewer}
    markdown={value}
    style={{
      fontSize: 12,
    }}
  />
);

import { MarkdownViewer } from '@stoplight/markdown-viewer';
import { Popover } from '@stoplight/ui-kit';
import { Box } from '@stoplight/mosaic';
import * as React from 'react';

export const Description: React.FunctionComponent<{ value: string }> = ({ value }) => (
  <Popover
    boundary="window"
    interactionKind="hover"
    className="flex-1 truncate flex items-baseline"
    target={<Box className="text-darken-7 dark:text-lighten-7 w-full truncate">{value}</Box>}
    targetClassName="text-darken-7 dark:text-lighten-6 w-full truncate"
    content={
      <Box p={5} style={{ maxHeight: 500, maxWidth: 400 }}>
        <MarkdownViewer markdown={value} />
      </Box>
    }
  />
);

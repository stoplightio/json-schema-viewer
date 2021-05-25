import { MarkdownViewer } from '@stoplight/markdown-viewer';
import * as React from 'react';

export const Description: React.FunctionComponent<{ value: string }> = ({ value }) => (
  <div className="sl-w-full sl-text-muted" title={value}>
    <MarkdownViewer markdown={value} />
  </div>
);

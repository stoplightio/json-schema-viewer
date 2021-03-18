import * as React from 'react';

export const Description: React.FunctionComponent<{ value: string }> = ({ value }) => (
  // TODO (JJ): Add mosaic popover showing full description in MarkdownViewer
  <div className="sl-truncate sl-w-full sl-text-muted" title={value}>
    {value}
  </div>
);

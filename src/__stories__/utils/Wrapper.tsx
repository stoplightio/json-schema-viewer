import * as React from 'react';

export const Wrapper: React.FunctionComponent<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => {
  return (
    <div
      // @ts-ignore
      style={{
        width: '100%',
        padding: 20,
        maxWidth: '800px',
        margin: 'auto',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

import * as React from 'react';

export const Wrapper: React.FunctionComponent<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => {
  return (
    <div style={{ padding: '200px auto' }}>
      <div
        // @ts-ignore
        style={{
          width: '100%',
          position: 'relative',
          height: '600px',
          padding: 20,
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

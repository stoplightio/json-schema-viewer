import * as React from 'react';

export const Wrapper: React.FunctionComponent<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => {
  return (
    <div style={{ margin: '200px auto', width: '80vw' }}>
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

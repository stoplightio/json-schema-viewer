import * as React from 'react';

export const Divider: React.FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <div className="flex items-center w-full h-2 absolute" style={{ top: -16, left: -16 }} {...props}>
      <div className="uppercase font-bold text-darken-7 pr-2">{children}</div>
      <div className="flex-1 bg-darken-5" style={{ height: 2 }} />
    </div>
  );
};

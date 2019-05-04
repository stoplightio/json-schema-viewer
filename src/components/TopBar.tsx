import * as React from 'react';

export interface ITopBar {
  name?: string;
}

export const TopBar: React.FunctionComponent<ITopBar> = ({ name }) => {
  return (
    <div className="flex items-center text-sm px-6 font-semibold" style={{ height: 40 }}>
      {name && <div>{` ${name}`}</div>}
    </div>
  );
};
TopBar.displayName = 'JsonSchemaViewer.TopBar';

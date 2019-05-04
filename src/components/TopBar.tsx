import * as React from 'react';

export interface ITopBar {
  height: number;
  name?: string;
}

export const TopBar: React.FunctionComponent<ITopBar> = ({ name, height }) => {
  if (!name) return null;

  return (
    <div className="flex items-center text-sm px-6 font-semibold" style={{ height }}>
      <div>{` ${name}`}</div>
    </div>
  );
};
TopBar.displayName = 'JsonSchemaViewer.TopBar';

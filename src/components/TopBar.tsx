import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { JSONSchema4Metadata } from '../types';

export interface ITopBar {
  metadata: Pick<JSONSchema4, JSONSchema4Metadata>;
  name?: string;
}

export const TopBar: React.FunctionComponent<ITopBar> = ({ metadata, name }) => {
  return (
    <div className="flex items-center text-sm px-6 font-semibold" style={{ height: 40 }}>
      {name && <div>{` ${name}`}</div>}
      {/* <div className="ml-auto">
        {Object.entries(metadata).map(([prop, val]) => (
          <>
            <span>{prop}:</span>
            {` ${val}`}
          </>
        ))}
      </div> */}
    </div>
  );
};

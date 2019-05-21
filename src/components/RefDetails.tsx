import * as React from 'react';

interface IRefDetails {
  url?: string;
  fullName?: string;
}

export const RefDetails: React.FunctionComponent<IRefDetails> = ({ url, fullName, children }) => (
  <div className="p-5">
    {fullName && (
      <div className="py-1 flex items-baseline">
        <span className="font-medium pr-2 w-24">Name</span>
        <span className="m-1 px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded">{fullName}</span>
      </div>
    )}
    {url ? (
      <div className="py-1 flex items-baseline">
        <span className="font-medium pr-2 w-24">URL</span>
        <a className="m-1 px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded" href={url} title={url}>
          {url}
        </a>
      </div>
    ) : null}
  </div>
);

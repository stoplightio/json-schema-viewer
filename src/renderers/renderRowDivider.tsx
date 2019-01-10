import * as React from 'react';

interface IRowDivider {
  key: string;
  level: number;
  text: string;
}

export const renderRowDivider = ({ key, level, text }: IRowDivider) => {
  return (
    <div key={`${key}-d`} className={`JSV-divider--${level} h-10 flex items-center`}>
      <div className="c-muted pr-3 uppercase text-sm">{text}</div>
      <div className="h-px bg-grey-light flex-1 mr-4" />
    </div>
  );
};

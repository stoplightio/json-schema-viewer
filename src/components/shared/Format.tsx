import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { PropertyTypeColors } from './Types';

export const Format: React.FunctionComponent<{ schema: JSONSchema4 }> = ({ schema }) => {
  return (
    <span
      {...(typeof schema.type === 'string' && schema.type in PropertyTypeColors
        ? { className: `ml-2 ${PropertyTypeColors[schema.type as string]}` }
        : { className: 'ml-2' })}
    >
      {`<${schema.format}>`}
    </span>
  );
};

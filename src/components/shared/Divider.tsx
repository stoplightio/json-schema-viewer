import { Dictionary } from '@stoplight/types';
import * as React from 'react';
import { JSONSchemaCombinerName } from '../../types';

const DIVIDERS: Dictionary<string, JSONSchemaCombinerName> = {
  allOf: 'and',
  anyOf: 'and/or',
  oneOf: 'or',
};

export const Divider: React.FunctionComponent<{ kind: JSONSchemaCombinerName }> = ({ kind }) => (
  <div className="flex items-center w-full absolute" style={{ top: -9, height: 1 }}>
    <div className="text-darken-7 dark:text-lighten-8 uppercase text-xs pr-2 -ml-4">{DIVIDERS[kind]}</div>
    <div className="flex-1 bg-darken-5 dark:bg-lighten-5" style={{ height: 1 }} />
  </div>
);

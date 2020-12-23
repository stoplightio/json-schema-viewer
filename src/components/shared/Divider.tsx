import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { COMBINER_PRETTY_NAMES } from '../../consts';

export const Divider: React.FunctionComponent<{ kind: SchemaCombinerName }> = ({ kind }) => (
  <div className="flex items-center w-full absolute" style={{ top: -9, height: 1 }}>
    <div className="text-darken-7 dark:text-lighten-8 uppercase text-xs pr-2 -ml-4">{COMBINER_PRETTY_NAMES[kind]}</div>
    <div className="flex-1 bg-darken-5 dark:bg-lighten-5" style={{ height: 1 }} />
  </div>
);

import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { COMBINER_PRETTY_NAMES } from '../../consts';

export const Divider: React.FunctionComponent<{ kind?: SchemaCombinerName; style?: React.CSSProperties }> = ({
  kind,
  style,
}) => (
  <div className="sl-flex sl-text-center sl-w-full sl-absolute" style={{ ...style, ...(kind && { top: -9 }), height: 1 }}>
    {kind && (
      <div className="sl-pr-2 sl--ml-6 sl-uppercase sl-text-sm sl-text-muted">{COMBINER_PRETTY_NAMES[kind]}</div>
    )}
    {!kind && <div className="sl-flex-1" style={{ height: 1, backgroundColor: 'lightgray' }} />}
  </div>
);

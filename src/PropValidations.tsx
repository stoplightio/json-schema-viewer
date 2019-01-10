import { safeStringify } from '@stoplight/json';
import * as React from 'react';

import { IProp, IResolvedProp } from './types';
import { isCombiner } from './util/isCombiner';
import { pickValidations } from './util/pickValidations';

export const PropValidations: React.FunctionComponent<{ prop: IProp | IResolvedProp }> = ({ prop }) => {
  if (!isCombiner(prop)) {
    const validations = pickValidations(prop);

    return (
      <>
        {Object.entries(validations).reduce(
          (elems, [k, v]) => {
            let type = typeof v;

            if (k === 'default' && ['object', 'boolean'].includes(type)) {
              v = safeStringify(v);

              type = typeof v;
            }

            if (type === 'boolean') {
              elems.push(
                <div key={k}>
                  <b>{k}:</b> {v.toString()}
                </div>
              );
            } else if (type !== 'object') {
              elems.push(
                <div key={k}>
                  <b>{k}:</b> {v}
                </div>
              );
            }

            return elems;
          },
          [] as Array<React.ReactElement<any>>
        )}
      </>
    );
  }

  return null;
};

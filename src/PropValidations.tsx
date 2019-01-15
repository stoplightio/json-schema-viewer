import { safeStringify } from '@stoplight/json';
import { ISchema } from '@stoplight/types';
import * as React from 'react';
import { isCombiner } from './util/isCombiner';
import { pickValidations } from './util/pickValidations';
import { MutedText } from './common/MutedText';

export const PropValidations: React.FunctionComponent<{ prop: ISchema }> = ({ prop }) => {
  if (!isCombiner(prop)) {
    const validations = pickValidations(prop);

    return (
      <>
        {Object.entries(validations).map(([k, v]) => {
          let type = typeof v;

          if (k === 'default' && ['object', 'boolean'].includes(type)) {
            v = safeStringify(v);

            type = typeof v;
          }

          if (type === 'boolean') {
            return (
              <div key={k}>
                <MutedText as="b">{k}:</MutedText> {v.toString()}
              </div>
            );
          }

          if (type !== 'object') {
            return (
              <div key={k}>
                <MutedText as="b">{k}:</MutedText> {v}
              </div>
            );
          }

          return null;
        })}
      </>
    );
  }

  return null;
};

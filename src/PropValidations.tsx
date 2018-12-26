import * as React from 'react';

import includes = require('lodash/includes');

import { safeStringify } from '@stoplight/json';

import { isCombiner } from './util/isCombiner';
import { pickValidations } from './util/pickValidations';

export const PropValidations = ({ prop }: { prop: any }) => {
  if (!isCombiner(prop)) {
    const validations = pickValidations(prop);

    const elems = [];
    for (const k in validations) {
      if (!Object.prototype.hasOwnProperty.call(validations, k)) {
        continue;
      }

      let v = validations[k];

      let type = typeof v;

      if (k === 'default' && includes(['object', 'boolean'], type)) {
        v = safeStringify(v);

        type = typeof v;
      }

      if (type === 'object') {
        continue;
      } else if (type === 'boolean') {
        elems.push(
          <div key={k}>
            <b>{k}:</b> {v.toString()}
          </div>
        );
      } else {
        elems.push(
          <div key={k}>
            <b>{k}:</b> {v}
          </div>
        );
      }
    }

    if (elems.length) {
      return elems;
    }
  }

  return null;
};

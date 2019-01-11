import isArray = require('lodash/isArray');
import merge = require('lodash/merge');
import union = require('lodash/union');

export const buildAllOfSchema = ({ elems, schema = {} }: any) => {
  for (const e in elems) {
    if (!Object.prototype.hasOwnProperty.call(elems, e)) {
      continue;
    }

    const targetElems = elems[e];

    // nested allOf, for example, allOf -> $ref -> allOf
    if (elems[e].allOf) {
      buildAllOfSchema({ elems: targetElems.allOf, schema });
    } else {
      for (const key in targetElems) {
        if (isArray(targetElems[key])) {
          schema[key] = union(schema[key], targetElems[key]);
        } else if (typeof targetElems[key] === 'object') {
          schema[key] = merge(schema[key], targetElems[key]);
        } else {
          schema[key] = targetElems[key];
        }
      }
    }
  }

  return schema;
};

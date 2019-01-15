import { Dictionary, ISchema } from '@stoplight/types';
import isArray = require('lodash/isArray');
import merge = require('lodash/merge');
import union = require('lodash/union');

type buildAllOfSchema = (props: Dictionary<ISchema>, schema?: ISchema) => ISchema;

export const buildAllOfSchema: buildAllOfSchema = (props, schema = {}) => {
  for (const targetElems of Object.values<ISchema>(props)) {
    // nested allOf, for example, allOf -> $ref -> allOf
    if (targetElems.allOf) {
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

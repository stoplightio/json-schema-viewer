import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import _get = require('lodash/get');

export const lookupRef = (path: JsonPath, dereferencedSchema?: JSONSchema4): JSONSchema4 | null => {
  if (dereferencedSchema === undefined) {
    return null;
  }

  return _get(dereferencedSchema, path, null);
};

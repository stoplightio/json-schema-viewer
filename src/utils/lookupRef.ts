import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { get as _get } from 'lodash';

export const lookupRef = (path: JsonPath, dereferencedSchema?: JSONSchema4): JSONSchema4 | null => {
  if (dereferencedSchema === undefined) {
    return null;
  }

  return _get(dereferencedSchema, path, null);
};

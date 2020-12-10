import { get as _get, isEmpty as _isEmpty } from 'lodash';

import { isCombiner } from './isCombiner';

export const isSchemaViewerEmpty = (schema: unknown) => {
  if (typeof schema !== 'object' || schema === null) return true;

  const objectKeys = Object.keys(schema);
  if (objectKeys.length === 1 && isCombiner(objectKeys[0])) {
    return _isEmpty(_get(schema, objectKeys[0], []));
  }

  return false;
};

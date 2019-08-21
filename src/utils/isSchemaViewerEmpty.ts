import { get as _get, isEmpty as _isEmpty } from 'lodash-es';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isSchemaViewerEmpty = (schema: unknown) => {
  if (typeof schema !== 'object' || schema === null) return true;

  const objectKeys = Object.keys(schema);
  if (objectKeys.length === 1 && combinerTypes.includes(objectKeys[0])) {
    return _isEmpty(_get(schema, objectKeys[0], []));
  }

  return false;
};

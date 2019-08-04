// @ts-ignore
import get from 'lodash/get';
import { isEmpty } from './object';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isSchemaViewerEmpty = (schema: unknown) => {
  if (typeof schema !== 'object' || schema === null) return true;

  const objectKeys = Object.keys(schema);
  if (objectKeys.length === 1 && combinerTypes.includes(objectKeys[0])) {
    return isEmpty(get(schema, objectKeys[0], []));
  }

  return false;
};

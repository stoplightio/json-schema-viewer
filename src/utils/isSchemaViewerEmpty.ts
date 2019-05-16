import { ISchema } from '@stoplight/types';
import { get as _get, isEmpty as _isEmpty } from 'lodash';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isSchemaViewerEmpty = (schema: ISchema) => {
  const objectKeys = Object.keys(schema);

  if (objectKeys.length === 1 && combinerTypes.includes(objectKeys[0])) {
    return _isEmpty(_get(schema, objectKeys[0], []));
  }

  return false;
};

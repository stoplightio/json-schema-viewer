import { ISchema } from '@stoplight/types';
import { get, isEmpty } from 'lodash';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isSchemaViewerEmpty = (schema: ISchema) => {
  const objectKeys = Object.keys(schema);

  if (objectKeys.length === 1 && combinerTypes.includes(objectKeys[0])) {
    return isEmpty(get(schema, objectKeys[0], []));
  }

  return false;
};

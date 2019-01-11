import get = require('lodash/get');
import isEmpty = require('lodash/isEmpty');
import keys = require('lodash/keys');

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isSchemaViewerEmpty = (schema: object | string) => {
  const objectKeys = keys(schema);

  if (objectKeys.length === 1 && combinerTypes.includes(objectKeys[0])) {
    return isEmpty(get(schema, objectKeys[0], []));
  }

  return false;
};

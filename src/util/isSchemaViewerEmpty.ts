import * as _ from 'lodash';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isSchemaViewerEmpty = (schema: object | string) => {
  const keys = _.keys(schema);

  if (keys.length === 1 && combinerTypes.includes(keys[0])) {
    return _.isEmpty(_.get(schema, keys[0], []));
  }

  return false;
};

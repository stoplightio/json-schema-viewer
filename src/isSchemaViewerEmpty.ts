import * as _ from 'lodash';

export const isSchemaViewerEmpty = (schema: object) => {
  const keys = _.keys(schema);
  const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

  if (keys.length === 1 && _.includes(combinerTypes, keys[0])) {
    return _.isEmpty(_.get(schema, keys[0], []));
  }

  return false;
};

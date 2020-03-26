import { JSONSchema4 } from 'json-schema';
// @ts-ignore
import resolveAllOf from '@stoplight/json-schema-merge-allof';
import { cloneDeep } from 'lodash';

export const mergeAllOf = (schema: JSONSchema4) => {
  return resolveAllOf(cloneDeep(schema), {
    deep: false,
    resolvers: {
      defaultResolver(values: any) {
        return Object.assign({}, ...values);
      },
    },
  });
};

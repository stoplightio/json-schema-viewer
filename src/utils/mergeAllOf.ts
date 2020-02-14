import { JSONSchema4 } from 'json-schema';
// @ts-ignore
import resolveAllOf from 'json-schema-merge-allof';
import { cloneDeep } from 'lodash-es';

export const mergeAllOf = (schema: JSONSchema4) => {
  return resolveAllOf(cloneDeep(schema), {
    resolvers: {
      defaultResolver(values: any) {
        return Object.assign({}, ...values);
      },
    },
  });
};

import { JSONSchema4 } from 'json-schema';
// @ts-ignore
import resolveAllOf from 'json-schema-merge-allof';

export const mergeAllOf = (schema: JSONSchema4) => {
  return resolveAllOf(schema, {
    resolvers: {
      defaultResolver(values: any) {
        return Object.assign({}, ...values);
      },
    },
  });
};

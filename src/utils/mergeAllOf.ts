import { pathToPointer } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { cloneDeep, compact } from 'lodash';
import { ResolvingError } from '../errors';
import { WalkerRefResolver } from '../tree/utils/populateTree';

const resolveAllOf = require('@stoplight/json-schema-merge-allof');

function _mergeAllOf(schema: JSONSchema4, path: JsonPath, resolveRef: WalkerRefResolver) {
  return resolveAllOf(cloneDeep(schema), {
    deep: false,
    resolvers: {
      defaultResolver(values: unknown) {
        if (Array.isArray(values)) {
          return values;
        }

        return Object.assign({}, ...Object(values));
      },
      example(values: unknown[]) {
        return resolveAllOf.options.resolvers.enum(values) || null;
      },
      enum(values: unknown[]) {
        return resolveAllOf.options.resolvers.enum(compact(values)) || [];
      },
      $ref(values: unknown) {
        return {};
      },
    },
    $refResolver($ref: unknown) {
      if (typeof $ref !== 'string') {
        return {};
      }

      if (pathToPointer(path).startsWith($ref)) {
        throw new ResolvingError('Circular reference detected');
      }

      return resolveRef(null, $ref);
    },
  });
}

export const mergeAllOf = (schema: JSONSchema4, path: JsonPath, resolveRef: WalkerRefResolver) => {
  try {
    return _mergeAllOf(schema, path, resolveRef);
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};

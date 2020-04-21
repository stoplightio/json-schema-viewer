import { JSONSchema4 } from 'json-schema';
import { cloneDeep, isObject } from 'lodash';
import { ResolvingError } from '../errors';
import { WalkerRefResolver } from '../tree/utils/populateTree';

const resolveAllOf = require('@stoplight/json-schema-merge-allof');

function _mergeAllOf(schema: JSONSchema4, resolveRef: WalkerRefResolver, seen: Set<string>) {
  return resolveAllOf(cloneDeep(schema), {
    deep: false,
    resolvers: {
      defaultResolver(values: any) {
        return Object.assign({}, ...values);
      },
      $ref(values: unknown) {
        return {};
      },
    },
    $refResolver($ref: unknown) {
      if (typeof $ref !== 'string') {
        return {};
      }

      const resolved = resolveRef(null, $ref);
      if (seen.has($ref)) {
        throw new ResolvingError('Circular reference detected');
      }

      seen.add($ref);
      return isObject(resolved) && 'allOf' in resolved ? _mergeAllOf(resolved, resolveRef, seen) : resolved;
    },
  });
}

export const mergeAllOf = (schema: JSONSchema4, resolveRef: WalkerRefResolver) =>
  _mergeAllOf(schema, resolveRef, new Set());

import { pathToPointer, safeStringify } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { ResolvingError } from '../../errors';
import { WalkingOptions } from './populateTree';

const resolveAllOf = require('@stoplight/json-schema-merge-allof');

const store = new WeakMap<WalkingOptions, WeakMap<JSONSchema4, string[]>>();

function _mergeAllOf(schema: JSONSchema4, path: JsonPath, opts: WalkingOptions) {
  return resolveAllOf(schema, {
    deep: false,
    resolvers: resolveAllOf.stoplightResolvers,
    $refResolver($ref: unknown) {
      if (typeof $ref !== 'string') {
        return {};
      }

      if (pathToPointer(path).startsWith($ref)) {
        throw new ResolvingError('Circular reference detected');
      }

      const allRefs = store.get(opts)!;
      const schemaRefs = allRefs.get(schema);

      if (schemaRefs === void 0) {
        allRefs.set(schema, [$ref]);
      } else if (schemaRefs.includes($ref)) {
        const resolved = JSON.parse(safeStringify(opts.resolveRef(null, $ref)));
        return 'allOf' in resolved ? _mergeAllOf(resolved, path, opts) : resolved;
      } else {
        schemaRefs.push($ref);
      }

      return opts.resolveRef(null, $ref);
    },
  });
}

export const mergeAllOf = (schema: JSONSchema4, path: JsonPath, opts: WalkingOptions) => {
  try {
    if (!store.has(opts)) {
      store.set(opts, new WeakMap());
    }

    return _mergeAllOf(schema, path, opts);
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};

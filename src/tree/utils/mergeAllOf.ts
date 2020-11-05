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
      let schemaRefs = allRefs.get(schema);

      if (schemaRefs === void 0) {
        schemaRefs = [$ref];
        allRefs.set(schema, schemaRefs);
      } else if (schemaRefs.includes($ref)) {
        const safelyResolved = JSON.parse(safeStringify(opts.resolveRef(null, $ref)));
        return 'allOf' in safelyResolved ? _mergeAllOf(safelyResolved, path, opts) : safelyResolved;
      } else {
        schemaRefs.push($ref);
      }

      const resolved = opts.resolveRef(null, $ref);

      if (Array.isArray(resolved.allOf)) {
        for (const member of resolved.allOf) {
          if (typeof member.$ref === 'string' && schemaRefs.includes(member.$ref)) {
            throw new ResolvingError('Circular reference detected');
          }
        }
      }

      return resolved;
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
    console.info(ex.message);
    throw ex;
  }
};

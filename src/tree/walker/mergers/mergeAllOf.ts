import { pathToPointer, safeStringify } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';
import { ResolvingError } from '../../errors';
import { SchemaFragment, WalkingOptions } from '../types';

const resolveAllOf = require('@stoplight/json-schema-merge-allof');

const store = new WeakMap<WalkingOptions, WeakMap<SchemaFragment, string[]>>();

function _mergeAllOf(fragment: SchemaFragment, path: JsonPath, walkingOptions: WalkingOptions): SchemaFragment {
  return resolveAllOf(fragment, {
    deep: false,
    resolvers: resolveAllOf.stoplightResolvers,
    $refResolver($ref: unknown) {
      if (typeof $ref !== 'string') {
        return {};
      }

      if (pathToPointer(path).startsWith($ref)) {
        throw new ResolvingError('Circular reference detected');
      }

      const allRefs = store.get(walkingOptions)!;
      let schemaRefs = allRefs.get(fragment);

      if (schemaRefs === void 0) {
        schemaRefs = [$ref];
        allRefs.set(fragment, schemaRefs);
      } else if (schemaRefs.includes($ref)) {
        const safelyResolved = JSON.parse(safeStringify(walkingOptions.resolveRef(null, $ref)));
        return 'allOf' in safelyResolved ? _mergeAllOf(safelyResolved, path, walkingOptions) : safelyResolved;
      } else {
        schemaRefs.push($ref);
      }

      const resolved = walkingOptions.resolveRef(null, $ref);

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

export function mergeAllOf(fragment: SchemaFragment, path: JsonPath, walkingOptions: WalkingOptions) {
  try {
    if (!store.has(walkingOptions)) {
      store.set(walkingOptions, new WeakMap());
    }

    return _mergeAllOf(fragment, path, walkingOptions);
  } catch (ex) {
    console.info(ex.message);
    throw ex;
  }
}

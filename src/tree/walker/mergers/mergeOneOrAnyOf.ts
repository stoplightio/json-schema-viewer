import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isEmpty as _isEmpty } from 'lodash';
import { SchemaCombinerName, SchemaFragment, WalkingOptions } from '../types';
import { mergeAllOf } from './mergeAllOf';

export function mergeOneOrAnyOf(
  fragment: SchemaFragment,
  path: JsonPath,
  walkingOptions: WalkingOptions,
): SchemaFragment[] {
  const items =
    SchemaCombinerName.OneOf in fragment ? fragment[SchemaCombinerName.OneOf] : fragment[SchemaCombinerName.AnyOf];

  if (!Array.isArray(items)) return []; // just in case

  const merged: JSONSchema4[] = [];

  if (Array.isArray(fragment.allOf) && Array.isArray(items)) {
    for (const item of items) {
      merged.push({
        allOf: [...fragment.allOf, item],
      });
    }

    return merged;
  } else {
    for (const item of items) {
      const prunedSchema = { ...fragment };
      delete prunedSchema[combiner];

      const resolvedItem = typeof item.$ref === 'string' ? walkingOptions.resolveRef(null, item.$ref) : item;

      if (_isEmpty(prunedSchema)) {
        merged.push(resolvedItem);
      } else {
        const mergedSchema = {
          allOf: [prunedSchema, resolvedItem],
        };

        try {
          merged.push(mergeAllOf(mergedSchema, path, walkingOptions));
        } catch {
          merged.push(mergedSchema);
        }
      }
    }
  }

  return merged;
}

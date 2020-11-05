import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isEmpty as _isEmpty } from 'lodash';
import { mergeAllOf } from './mergeAllOf';
import { WalkingOptions } from './populateTree';

export function mergeOneOrAnyOf(
  schema: JSONSchema4,
  combiner: 'oneOf' | 'anyOf',
  path: JsonPath,
  options: WalkingOptions,
): JSONSchema4[] {
  const items = schema[combiner];

  if (!Array.isArray(items)) return []; // just in case

  const merged: JSONSchema4[] = [];

  if (Array.isArray(schema.allOf) && Array.isArray(items)) {
    for (const item of items) {
      merged.push({
        allOf: [...schema.allOf, item],
      });
    }

    return merged;
  } else {
    for (const item of items) {
      const prunedSchema = { ...schema };
      delete prunedSchema[combiner];

      const resolvedItem = typeof item.$ref === 'string' ? options.resolveRef(null, item.$ref) : item;

      if (_isEmpty(prunedSchema)) {
        merged.push(resolvedItem);
      } else {
        const mergedSchema = {
          allOf: [prunedSchema, resolvedItem],
        };

        try {
          merged.push(mergeAllOf(mergedSchema, path, options));
        } catch {
          merged.push(mergedSchema);
        }
      }
    }
  }

  return merged;
}

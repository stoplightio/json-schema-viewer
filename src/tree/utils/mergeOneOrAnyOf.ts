import { JsonPath } from '@stoplight/types';
import { isObject } from 'lodash';
import { JSONSchema } from '../../types';
import { mergeAllOf } from './mergeAllOf';
import { WalkingOptions } from './populateTree';

export function mergeOneOrAnyOf(
  schema: JSONSchema,
  combiner: 'oneOf' | 'anyOf',
  path: JsonPath,
  options: WalkingOptions,
): JSONSchema[] {
  const items = schema[combiner];

  if (!Array.isArray(items)) return []; // just in case

  const merged: JSONSchema[] = [];

  if (Array.isArray(schema.allOf) && Array.isArray(items)) {
    for (const item of items) {
      merged.push({
        allOf: [...schema.allOf, item].filter<object>(isObject),
      });
    }

    return merged;
  } else {
    for (const item of items) {
      const prunedSchema = { ...schema };
      delete prunedSchema[combiner];

      merged.push(
        mergeAllOf(
          {
            allOf: [prunedSchema, item].filter<object>(isObject),
          },
          path,
          options,
        ),
      );
    }
  }

  return merged;
}

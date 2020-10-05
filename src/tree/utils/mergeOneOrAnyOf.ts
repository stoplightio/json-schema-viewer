import { JSONSchema4 } from 'json-schema';

export function mergeOneOrAnyOf(schema: JSONSchema4, combiner: 'oneOf' | 'anyOf'): JSONSchema4[] {
  const items = schema[combiner];

  if (!Array.isArray(items)) return []; // just in case

  if (!Array.isArray(schema.allOf)) return items;

  const merged: JSONSchema4[] = [];

  if (Array.isArray(items)) {
    for (const item of items) {
      merged.push({
        allOf: [...schema.allOf, item],
      });
    }
  }

  return merged;
}

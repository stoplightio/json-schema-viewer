import { JSONSchema4 } from 'json-schema';

export function mergeOneOrAnyOf(schema: JSONSchema4, combiner: 'oneOf' | 'anyOf'): JSONSchema4[] {
  const merged: JSONSchema4[] = [];

  if (!Array.isArray(schema.allOf)) return merged;

  const items = schema[combiner];

  if (Array.isArray(items)) {
    for (const item of items) {
      merged.push({
        allOf: [item, ...schema.allOf],
      });
    }
  }

  return merged;
}

import { isPlainObject } from '@stoplight/json';
import type { SchemaNode } from '@stoplight/json-schema-tree';

export function getInternalSchemaError(schemaNode: SchemaNode): string | undefined {
  let errorMessage;
  const fragment: unknown = schemaNode.fragment;
  if (!isPlainObject(fragment)) return;

  const xStoplight = fragment['x-stoplight'];

  if (isPlainObject(xStoplight) && typeof xStoplight['error-message'] === 'string') {
    errorMessage = xStoplight['error-message'];
  } else {
    const fragmentErrorMessage = fragment['x-sl-error-message'];
    if (typeof fragmentErrorMessage === 'string') {
      errorMessage = fragmentErrorMessage;
    } else {
      const items: unknown = fragment['items'];
      if (isPlainObject(items)) {
        const itemsErrorMessage = items['x-sl-error-message'];
        if (typeof itemsErrorMessage === 'string') {
          errorMessage = itemsErrorMessage;
        }
      }
    }
  }

  return errorMessage;
}

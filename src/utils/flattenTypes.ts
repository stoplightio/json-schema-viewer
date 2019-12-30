import { Optional } from '@stoplight/types';
import { JSONSchema4TypeName } from 'json-schema';
import { isValidType } from './isValidType';

function getTypeFromObject(obj: object): Optional<JSONSchema4TypeName> {
  const size = Object.keys(obj).length;

  if (size > 1 || !('type' in obj)) {
    throw new Error(
      'The "type" property must be a string, or an array of strings. Objects and array of objects are not valid.',
    );
  }

  if ('type' in obj && isValidType((obj as { type: string }).type)) {
    return (obj as { type: JSONSchema4TypeName }).type;
  }

  return;
}

function flattenType(type: unknown) {
  if (typeof type === 'string') {
    return type;
  }

  if (typeof type !== 'object' || type === null) {
    return;
  }

  return getTypeFromObject(type);
}

export const flattenTypes = (types: unknown): Optional<JSONSchema4TypeName | JSONSchema4TypeName[]> => {
  if (typeof types === 'string' && isValidType(types)) {
    return types;
  }

  if (typeof types !== 'object' || types === null) {
    return;
  }

  if (Array.isArray(types)) {
    const flattenedTypes: JSONSchema4TypeName[] = [];
    for (const type of types) {
      const flattened = flattenType(type);
      if (!isValidType(flattened) || flattenedTypes.includes(flattened)) continue;
      flattenedTypes.push(flattened);
    }

    return flattenedTypes.length > 0 ? flattenedTypes : void 0;
  }

  return getTypeFromObject(types);
};

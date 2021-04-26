import { JSONSchema4TypeName, JSONSchema6TypeName } from 'json-schema';
import { SchemaKind } from '../types';

export const isValidType = (maybeType: unknown): maybeType is JSONSchema4TypeName | JSONSchema6TypeName =>
  typeof maybeType === 'string' && Object.values(SchemaKind).includes(maybeType as SchemaKind);

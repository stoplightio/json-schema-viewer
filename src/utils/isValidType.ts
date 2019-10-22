import { JSONSchema4TypeName } from 'json-schema';
import { SchemaKind } from '../types';

export const isValidType = (maybeType: unknown): maybeType is JSONSchema4TypeName =>
  typeof maybeType === 'string' && Object.values(SchemaKind).includes(maybeType as SchemaKind);

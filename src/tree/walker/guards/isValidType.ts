import { SchemaNodeKind } from '../types';

export const isValidType = (maybeType: unknown): maybeType is SchemaNodeKind =>
  typeof maybeType === 'string' && Object.values(SchemaNodeKind).includes(maybeType as SchemaNodeKind);

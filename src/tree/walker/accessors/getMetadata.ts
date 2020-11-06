import { Dictionary } from '@stoplight/types';
import { pick as _pick } from 'lodash';
import { JSONSchema4Metadata, SchemaFragment } from '../types';

const METADATA: JSONSchema4Metadata[] = ['id', '$schema'];

export function getMetadata(fragment: SchemaFragment): Partial<Dictionary<unknown, JSONSchema4Metadata>> {
  return _pick(fragment, METADATA);
}

import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { pick as _pick } from 'lodash';
import { JSONSchema } from '../types';

const METADATA = ['id', '$id', '$schema'];

export function getMetadata(
  node: JSONSchema,
): Pick<JSONSchema, '$schema'> & (Pick<JSONSchema4, 'id'> | Pick<JSONSchema6 | JSONSchema7, '$id'>) {
  return _pick(node, METADATA);
}

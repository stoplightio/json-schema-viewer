import { pick as _pick } from 'lodash';
import { JSONSchema, JSONSchemaAnnotations } from '../types';

const ANNOTATIONS: JSONSchemaAnnotations[] = ['description', 'default', 'examples'];

export function getAnnotations(node: JSONSchema) {
  return _pick(node, ANNOTATIONS);
}

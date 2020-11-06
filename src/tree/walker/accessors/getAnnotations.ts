import { JSONSchema4 } from 'json-schema';
import { pick as _pick } from 'lodash';
import { SchemaAnnotations } from '../types';

const ANNOTATIONS: SchemaAnnotations[] = ['description', 'default', 'examples'];

export function getAnnotations(fragment: JSONSchema4) {
  return _pick(fragment, ANNOTATIONS);
}

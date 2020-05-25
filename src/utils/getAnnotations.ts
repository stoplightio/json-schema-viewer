import { JSONSchema4 } from 'json-schema';
import { pick as _pick } from 'lodash';
import { JSONSchema4Annotations } from '../types';

const ANNOTATIONS: JSONSchema4Annotations[] = ['description', 'default', 'examples'];

export function getAnnotations(node: JSONSchema4) {
  return _pick(node, ANNOTATIONS);
}

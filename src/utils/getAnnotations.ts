import { JSONSchema4 } from 'json-schema';
import _pick = require('lodash/pick');
import { JSONSchema4Annotations } from '../types';

const ANNOTATIONS: JSONSchema4Annotations[] = ['title', 'description', 'default', 'examples'];

export function getAnnotations(node: JSONSchema4) {
  return _pick(node, ANNOTATIONS);
}

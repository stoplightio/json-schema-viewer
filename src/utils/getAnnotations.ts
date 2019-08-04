import { Dictionary } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { JSONSchema4Annotations } from '../types';
import { pick } from './object';

const ANNOTATIONS: JSONSchema4Annotations[] = ['title', 'description', 'default', 'examples'];

export function getAnnotations(node: JSONSchema4): Dictionary<unknown> {
  return pick(node, ANNOTATIONS) as Dictionary<unknown>;
}

import { JSONSchema4 } from 'json-schema';
import { JSONSchema4Metadata } from '../types';
import { pick } from './object';

const METADATA: JSONSchema4Metadata[] = ['id', '$schema'];

export function getMetadata(node: JSONSchema4): Pick<JSONSchema4, JSONSchema4Metadata> {
  return pick(node, METADATA);
}

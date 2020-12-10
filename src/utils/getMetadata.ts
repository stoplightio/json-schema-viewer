import { JSONSchema4 } from 'json-schema';
import { pick as _pick } from 'lodash';

import { JSONSchema4Metadata } from '../types';

const METADATA: JSONSchema4Metadata[] = ['id', '$schema'];

export function getMetadata(node: JSONSchema4): Pick<JSONSchema4, JSONSchema4Metadata> {
  return _pick(node, METADATA);
}

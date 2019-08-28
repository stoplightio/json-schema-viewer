import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { inferType } from './inferType';

export function getNodeType(node: JSONSchema4): JSONSchema4TypeName | JSONSchema4TypeName[] | undefined {
  return node.type ? node.type : inferType(node);
}

import { JSONSchema4TypeName } from 'json-schema';
import { IArrayNode, JSONSchema4CombinerName } from '../types';
import { getCombiner } from './getCombiner';
import { inferType } from './inferType';

export function getArraySubtype(
  node: IArrayNode,
): JSONSchema4TypeName | JSONSchema4TypeName[] | JSONSchema4CombinerName | string | undefined {
  if (!node.items || Array.isArray(node.items)) return;
  if ('$ref' in node.items) {
    return `$ref( ${node.items.$ref} )`;
  }

  const combiner = getCombiner(node.items);

  if (combiner !== undefined) {
    return combiner;
  }

  return inferType(node.items);
}

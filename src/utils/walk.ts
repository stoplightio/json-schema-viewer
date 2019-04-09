import { JSONSchema4 } from 'json-schema';
import {
  IArrayNode,
  IBaseNode,
  ICombinerNode,
  IObjectNode,
  IRefNode,
  JSONSchema4CombinerName,
  SchemaKind,
  SchemaNode,
} from '../types';
import { getAnnotations } from './getAnnotations';
import { getValidations } from './getValidations';

const getCombiner = (node: JSONSchema4): JSONSchema4CombinerName | void => {
  if ('allOf' in node) return 'allOf';
  if ('anyOf' in node) return 'anyOf';
  if ('oneOf' in node) return 'oneOf';
};

export function* walk(schema: JSONSchema4[] | JSONSchema4): IterableIterator<SchemaNode> {
  if (Array.isArray(schema)) {
    for (const segment of schema) {
      yield* walk(segment);
    }

    return;
  }

  const node = schema as JSONSchema4;
  if (node.type !== undefined) {
    const base: IBaseNode = {
      type: node.type,
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };

    switch (node.type) {
      case SchemaKind.Array:
        (base as IArrayNode).items = node.array;
        (base as IArrayNode).additionalItems = node.additionalItems;
        break;
      case SchemaKind.Object:
        (base as IObjectNode).properties = node.properties;
        (base as IObjectNode).patternProperties = node.patternProperties;
        (base as IObjectNode).additionalProperties = node.additionalProperties;
        break;
    }

    yield base;
  } else if ('enum' in node) {
    yield {
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };
  } else if ('$ref' in node) {
    yield {
      $ref: node.$ref,
    } as IRefNode;
  } else {
    const combiner = getCombiner(node);
    if (combiner !== undefined) {
      yield {
        combiner,
        properties: node[combiner],
        annotations: getAnnotations(node),
      } as ICombinerNode;
    }
  }

  // if ('not' in node) {
  //   // todo: shall we support it?
  // }
}

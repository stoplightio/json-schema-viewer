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
import { assignId } from './assignId';
import { getAnnotations } from './getAnnotations';
import { getValidations } from './getValidations';

const getCombiner = (node: JSONSchema4): JSONSchema4CombinerName | void => {
  if ('allOf' in node) return 'allOf';
  if ('anyOf' in node) return 'anyOf';
  if ('oneOf' in node) return 'oneOf';
};

function assignNodeSpecificFields(base: IBaseNode, node: JSONSchema4) {
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
}

function processNode(node: JSONSchema4): SchemaNode | void {
  if (node.type !== undefined) {
    const base: IBaseNode = {
      id: assignId(node),
      type: node.type,
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };

    if (Array.isArray(node.type)) {
      if (node.type.includes('object')) {
        // special case :P
        assignNodeSpecificFields(base, {
          ...node,
          type: 'object',
        });
      }
    } else {
      assignNodeSpecificFields(base, node);
    }

    return base;
  }

  if ('enum' in node) {
    return {
      id: assignId(node),
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };
  }

  if ('$ref' in node) {
    return {
      id: assignId(node),
      $ref: node.$ref,
    } as IRefNode;
  }

  const combiner = getCombiner(node);
  if (combiner !== undefined) {
    return {
      id: assignId(node),
      combiner,
      properties: node[combiner],
      annotations: getAnnotations(node),
    } as ICombinerNode;
  }

  // if ('not' in node) {
  //   // todo: shall we support it?
  // }
}

export function* walk(schema: JSONSchema4[] | JSONSchema4): IterableIterator<SchemaNode> {
  if (Array.isArray(schema)) {
    for (const segment of schema) {
      yield* walk(segment);
    }
  } else {
    const node = processNode(schema);
    if (node !== undefined) {
      yield node;
    }
  }
}

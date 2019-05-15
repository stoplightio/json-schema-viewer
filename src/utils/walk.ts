import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
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
  switch (getPrimaryType(node)) {
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

function inferType(node: JSONSchema4): JSONSchema4TypeName | undefined {
  if ('properties' in node) {
    return SchemaKind.Object;
  }

  if ('items' in node) {
    return SchemaKind.Array;
  }

  return;
}

export function getPrimaryType(node: JSONSchema4) {
  if (node.type !== undefined) {
    if (Array.isArray(node.type)) {
      if (node.type.includes(SchemaKind.Object)) {
        return SchemaKind.Object;
      }

      if (node.type.includes(SchemaKind.Array)) {
        return SchemaKind.Array;
      }
    }

    return node.type;
  }

  return inferType(node);
}

function processNode(node: JSONSchema4): SchemaNode | void {
  const combiner = getCombiner(node);

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

  if (combiner === undefined) {
    const base: IBaseNode = {
      id: assignId(node),
      type: node.type || inferType(node),
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };

    assignNodeSpecificFields(base, node);

    return base;
  } else {
    return {
      id: assignId(node),
      combiner,
      properties: node[combiner],
      annotations: getAnnotations(node),
      ...(node.type !== undefined && { type: node.type }),
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

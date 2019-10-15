import { JSONSchema4 } from 'json-schema';
import {
  IArrayNode,
  IBaseNode,
  ICombinerNode,
  IObjectNode,
  IRefNode,
  SchemaKind,
  SchemaNode,
} from '../types';
import { generateId } from './generateId';
import { getAnnotations } from './getAnnotations';
import { getPrimaryType } from './getPrimaryType';
import { getValidations } from './getValidations';
import { inferType } from './inferType';
import { getCombiner } from './getCombiner';

function assignNodeSpecificFields(base: IBaseNode, node: JSONSchema4) {
  switch (getPrimaryType(node)) {
    case SchemaKind.Array:
      (base as IArrayNode).items = node.items;
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
  const combiner = getCombiner(node);
  const type = node.type || inferType(node);

  if (combiner) {
    const properties = node[combiner];
    return {
      id: generateId(),
      combiner,
      properties: Array.isArray(properties) ? properties.slice() : properties,
      annotations: getAnnotations(node),
      ...(type !== undefined && { type }),
    } as ICombinerNode;
  }

  if (type) {
    const base: IBaseNode = {
      id: generateId(),
      type: node.type || inferType(node),
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };

    assignNodeSpecificFields(base, node);

    return base;
  }

  if ('enum' in node) {
    return {
      id: generateId(),
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
    };
  }

  if ('$ref' in node) {
    return {
      id: generateId(),
      $ref: node.$ref,
    } as IRefNode;
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

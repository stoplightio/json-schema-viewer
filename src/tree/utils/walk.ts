import { JSONSchema4 } from 'json-schema';
import { IArrayNode, IBaseNode, ICombinerNode, IObjectNode, SchemaKind, SchemaNode } from '../../types';
import { flattenTypes } from '../../utils/flattenTypes';
import { generateId } from '../../utils/generateId';
import { getAnnotations } from '../../utils/getAnnotations';
import { getCombiner } from '../../utils/getCombiner';
import { getPrimaryType } from '../../utils/getPrimaryType';
import { getValidations } from '../../utils/getValidations';
import { inferType } from '../../utils/inferType';
import { normalizeRequired } from '../../utils/normalizeRequired';

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
      type: flattenTypes(type),
      validations: getValidations(node),
      annotations: getAnnotations(node),
      ...('required' in node && { required: normalizeRequired(node.required) }),
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
      $ref: typeof node.$ref !== 'string' ? null : node.$ref,
    };
  }

  // if ('not' in node) {
  //   // todo: shall we support it?
  // }

  return {
    id: generateId(),
    validations: {},
    annotations: {},
  };
}

export type WalkerValue = {
  node: SchemaNode;
  fragment: JSONSchema4;
};

export function* walk(schema: JSONSchema4[] | JSONSchema4): IterableIterator<WalkerValue> {
  if (Array.isArray(schema)) {
    for (const segment of schema) {
      yield* walk(segment);
    }
  } else {
    const node = processNode(schema);
    if (node !== void 0) {
      yield {
        node,
        fragment: schema,
      };
    }
  }
}

import { Optional } from '@stoplight/types';
import { isObject as _isObject } from 'lodash';
import { IArrayNode, IBaseNode, ICombinerNode, IObjectNode, JSONSchema, SchemaKind, SchemaNode } from '../../types';
import { flattenTypes } from '../../utils/flattenTypes';
import { generateId } from '../../utils/generateId';
import { getAnnotations } from '../../utils/getAnnotations';
import { getCombiners } from '../../utils/getCombiners';
import { getPrimaryType } from '../../utils/getPrimaryType';
import { getValidations } from '../../utils/getValidations';
import { inferType } from '../../utils/inferType';
import { normalizeRequired } from '../../utils/normalizeRequired';

function assignNodeSpecificFields(base: IBaseNode, node: JSONSchema) {
  switch (getPrimaryType(node)) {
    case SchemaKind.Array:
      (base as IArrayNode).items = unwrapItemsOrUndefined(node.items);
      (base as IArrayNode).additionalItems =
        typeof node.additionalItems === 'boolean' ? node.additionalItems : unwrapItemsOrUndefined(node.additionalItems);
      break;
    case SchemaKind.Object:
      (base as IObjectNode).properties = unwrapPropertiesOrUndefined(node.properties);
      (base as IObjectNode).patternProperties = unwrapPropertiesOrUndefined(node.patternProperties);
      (base as IObjectNode).additionalProperties =
        typeof node.additionalProperties === 'boolean'
          ? node.additionalProperties
          : unwrapPropertiesOrUndefined(node.additionalProperties);
      break;
  }
}

export function* processNode(node: JSONSchema): IterableIterator<SchemaNode> {
  const combiners = getCombiners(node);
  const type = node.type || inferType(node);
  const title = typeof node.title === 'string' ? { title: node.title } : null;

  if (combiners !== void 0) {
    for (const combiner of combiners) {
      const properties = node[combiner];
      const combinerNode: ICombinerNode = {
        id: generateId(),
        combiner,
        properties: (Array.isArray(properties) ? properties.slice() : properties) as ICombinerNode['properties'],
        annotations: getAnnotations(node),
        ...(type !== void 0 && { type: flattenTypes(type) }),
        ...title,
      };

      yield combinerNode;
    }
  } else if (type) {
    const primaryType = getPrimaryType(node);
    let validationNode: JSONSchema = node;
    if (
      primaryType === SchemaKind.Array &&
      _isObject(node.items) &&
      !Array.isArray(node.items) &&
      getCombiners(node.items) === void 0
    ) {
      const validationNodePrimaryType = getPrimaryType(node.items);
      if (validationNodePrimaryType !== SchemaKind.Array && validationNodePrimaryType !== SchemaKind.Object) {
        validationNode = node.items;
      }
    }

    const base: IBaseNode = {
      id: generateId(),
      type: flattenTypes(type),
      validations: getValidations(validationNode),
      annotations: getAnnotations(node),
      ...('required' in node && { required: normalizeRequired(node.required) }),
      enum: node.enum,
      ...title,
    };

    assignNodeSpecificFields(base, node);

    yield base;
  } else if ('enum' in node) {
    yield {
      id: generateId(),
      validations: getValidations(node),
      annotations: getAnnotations(node),
      enum: node.enum,
      ...title,
    };
  } else if ('$ref' in node) {
    yield {
      id: generateId(),
      $ref: typeof node.$ref !== 'string' ? null : node.$ref,
      ...title,
    };
  } else if ('not' in node) {
    // todo: shall we support it?
  } else {
    yield {
      id: generateId(),
      validations: {},
      annotations: {},
    };
  }
}

export type WalkerValue = {
  node: SchemaNode;
  fragment: JSONSchema;
};

export function* walk(schema: JSONSchema[] | JSONSchema): IterableIterator<WalkerValue> {
  if (Array.isArray(schema)) {
    for (const segment of schema) {
      yield* walk(segment);
    }
  } else {
    for (const node of processNode(schema)) {
      yield {
        node,
        fragment: schema,
      };
    }
  }
}

function unwrapItemsOrUndefined<T = unknown>(value: T): Optional<T> {
  return _isObject(value) ? value : void 0;
}

function unwrapPropertiesOrUndefined<T = unknown>(value: T): Optional<T> {
  return _isObject(value) && !Array.isArray(value) ? value : void 0;
}

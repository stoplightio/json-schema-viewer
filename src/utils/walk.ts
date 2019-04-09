import { JSONSchema4 } from 'json-schema';
import { IArrayNode, IBaseNode, ICombinerNode, IObjectNode, JSONSchema4CombinerName, SchemaKind } from '../types';
import { getAnnotations } from './getAnnotations';
import { getValidations } from './getValidations';

const getCombiner = (node: JSONSchema4): JSONSchema4CombinerName | void => {
  if ('allOf' in node) return 'allOf';
  if ('anyOf' in node) return 'anyOf';
  if ('oneOf' in node) return 'oneOf';
};

export function* walk(
  schema: JSONSchema4[] | JSONSchema4
): IterableIterator<IBaseNode | IArrayNode | IObjectNode | ICombinerNode> {
  if (Array.isArray(schema)) {
    for (const node of schema) {
      yield* walk(node);
    }
  } else {
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
}

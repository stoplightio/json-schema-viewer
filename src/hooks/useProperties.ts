import { Dictionary, JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { useMemo } from 'react';
import { IArrayNode, IObjectNode, SchemaKind, SchemaTreeNode } from '../types';
import { isCombiner } from '../utils/isCombiner';
import { isExpanded } from '../utils/isExpanded';
import { walk } from '../utils/walk';

export interface IRenderOptions {
  limitPropertyCount?: number;
  defaultExpandedDepth: number;
  expandedRows: Dictionary<boolean>;
}

function* getProperties(
  schema: JSONSchema4,
  options: IRenderOptions,
  level = 0,
  path: JsonPath = [],
  meta: object | null = null
): IterableIterator<SchemaTreeNode> {
  const { defaultExpandedDepth, expandedRows } = options;

  for (const node of walk(schema)) {
    const baseNode: SchemaTreeNode = {
      ...node,
      level,
      path,
      ...(schema.items !== undefined && !Array.isArray(schema.items) && { subtype: schema.items.type }),
      ...meta,
    };

    const expanded = isExpanded(baseNode, defaultExpandedDepth, expandedRows);

    if (isCombiner(node)) {
      yield {
        ...baseNode,
        expanded,
      };

      if (expanded && node.properties !== undefined) {
        const isConditionalCombiner = node.combiner === 'anyOf' || node.combiner === 'oneOf';
        for (const [i, property] of node.properties.entries()) {
          yield* getProperties(property, options, level + 1, [...path, i], {
            showDivider: isConditionalCombiner && i !== 0,
          });
        }
      }
    } else {
      switch (node.type) {
        case SchemaKind.Object:
          yield {
            ...baseNode,
            expanded,
            ...((node as IObjectNode).additionalProperties && {
              additional: (node as IObjectNode).additionalProperties,
            }),
          };

          if (expanded && schema.properties !== undefined) {
            for (const [prop, property] of Object.entries(schema.properties)) {
              yield* getProperties(property, options, level + 1, [...path, prop], {
                name: prop,
                required: Array.isArray(schema.required) && schema.required.includes(prop),
              });
            }
          }

          break;
        case SchemaKind.Array:
          yield {
            ...baseNode,
            // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.3.1.2
            ...(!('subtype' in baseNode) &&
              (node as IArrayNode).additionalItems && { additional: (node as IArrayNode).additionalItems }),
          };

          if (expanded) {
            if (Array.isArray(schema.items)) {
              for (const [i, property] of schema.items.entries()) {
                yield* getProperties(property, options, level + 1, [...path, i]);
              }
            } else if (baseNode.subtype === 'object' && schema.items!.properties) {
              for (const [prop, property] of Object.entries(schema.items!.properties)) {
                yield* getProperties(property, options, level + 1, [...path, prop], {
                  name: prop,
                  required: !Array.isArray(schema.required) || schema.required.includes(prop),
                });
              }
            } else if (baseNode.subtype === 'array') {
              yield* getProperties(schema.items!, options, level + 1, path);
            }
          }

          break;
        default:
          yield baseNode;
      }
    }
  }
}

export const useProperties = (schema: JSONSchema4, options: IRenderOptions) => {
  return useMemo(
    () => {
      let { limitPropertyCount } = options;
      const nodes: SchemaTreeNode[] = [];
      let isOverflow = false;

      for (const node of getProperties(schema, options)) {
        if (limitPropertyCount !== undefined && limitPropertyCount-- < 0) {
          isOverflow = true;
          break;
        }

        nodes.push(node);
      }

      return { isOverflow, properties: nodes };
    },
    [options.limitPropertyCount, options.defaultExpandedDepth, options.expandedRows]
  );
};

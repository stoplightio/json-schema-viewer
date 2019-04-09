import { Dictionary } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { IArrayNode, IObjectNode, ITreeNodeMeta, SchemaKind, SchemaTreeNode } from '../types';
import { isCombiner } from './isCombiner';
import { isExpanded } from './isExpanded';
import { isRef } from './isRef';
import { lookupRef } from './lookupRef';
import { walk } from './walk';

export interface IFilterOptions {
  limitPropertyCount?: number;
  defaultExpandedDepth: number;
  expandedRows: Dictionary<boolean>;
}

export function* getProperties(
  schema: JSONSchema4,
  dereferencedSchema: JSONSchema4 | undefined,
  options: IFilterOptions,
  meta: object = { level: 0, path: [] }
): IterableIterator<SchemaTreeNode> {
  const { defaultExpandedDepth, expandedRows } = options;
  const { level, path } = meta as ITreeNodeMeta;

  for (const node of walk(schema)) {
    const baseNode: SchemaTreeNode = {
      ...node,
      level,
      path,
      ...(schema.items !== undefined && !Array.isArray(schema.items) && { subtype: schema.items.type }),
      ...meta,
    };

    const expanded = isExpanded(baseNode, defaultExpandedDepth, expandedRows);

    if (isRef(node)) {
      const resolved = lookupRef(path, dereferencedSchema);
      if (resolved) {
        yield* getProperties(resolved, dereferencedSchema, options, {
          ...meta,
          inheritedFrom: node.$ref,
        });
      } else {
        yield {
          ...baseNode,
          $ref: node.$ref,
        };
      }
    } else if (isCombiner(node)) {
      yield {
        ...baseNode,
        expanded,
      };

      if (expanded && node.properties !== undefined) {
        const isConditionalCombiner = node.combiner === 'anyOf' || node.combiner === 'oneOf';
        for (const [i, property] of node.properties.entries()) {
          yield* getProperties(property, dereferencedSchema, options, {
            showDivider: isConditionalCombiner && i !== 0,
            level: level + 1,
            path: [...path, 'properties', i],
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
              yield* getProperties(property, dereferencedSchema, options, {
                name: prop,
                required: Array.isArray(schema.required) && schema.required.includes(prop),
                level: level + 1,
                path: [...path, 'properties', prop],
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
                yield* getProperties(property, dereferencedSchema, options, {
                  level: level + 1,
                  path: [...path, 'items', i],
                });
              }
            } else if (baseNode.subtype === 'object' && schema.items!.properties) {
              for (const [prop, property] of Object.entries(schema.items!.properties)) {
                yield* getProperties(property, dereferencedSchema, options, {
                  name: prop,
                  required: !Array.isArray(schema.required) || schema.required.includes(prop),
                  level: level + 1,
                  path: [...path, 'items', prop],
                });
              }
            } else if (baseNode.subtype === 'array' && schema.items) {
              yield* getProperties(schema.items, dereferencedSchema, options, {
                level: level + 1,
                path,
              });
            }
          }

          break;
        default:
          yield baseNode;
      }
    }
  }
}

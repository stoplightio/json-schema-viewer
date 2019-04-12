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

type Walker<T extends object = ITreeNodeMeta> = (
  schema: JSONSchema4,
  dereferencedSchema: JSONSchema4 | undefined,
  options: IFilterOptions,
  meta?: T
) => IterableIterator<SchemaTreeNode>;

const getProperties: Walker = function*(schema, dereferencedSchema, options, meta) {
  if (schema.properties !== undefined) {
    const { level, path } = meta!;
    for (const [prop, property] of Object.entries(schema.properties)) {
      yield* renderSchema(property, dereferencedSchema, options, {
        name: prop,
        required: Array.isArray(schema.required) && schema.required.includes(prop),
        level: level + 1,
        path: [...path, prop],
      });
    }
  }
};

const getPatternProperties: Walker = function*(schema, dereferencedSchema, options, meta) {
  if (schema.patternProperties !== undefined) {
    const { level, path } = meta!;
    for (const [prop, property] of Object.entries(schema.patternProperties)) {
      yield* renderSchema(property, dereferencedSchema, options, {
        name: prop,
        level: level + 1,
        path: [...path, prop],
        pattern: true,
      });
    }
  }
};

export const renderSchema: Walker<ITreeNodeMeta & { name?: string }> = function*(
  schema,
  dereferencedSchema,
  options,
  meta = { level: 0, path: [] }
) {
  const { defaultExpandedDepth, expandedRows } = options;
  const { level, path } = meta;

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
        yield* renderSchema(resolved, dereferencedSchema, options, {
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
          yield* renderSchema(property, dereferencedSchema, options, {
            showDivider: isConditionalCombiner && i !== 0,
            level: level + 1,
            path: [...path, 'properties', i],
          });
        }
      }
    } else if (node.type === SchemaKind.Array) {
      yield {
        ...baseNode,
        // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.3.1.2
        ...(!('subtype' in baseNode) &&
          (node as IArrayNode).additionalItems && { additional: (node as IArrayNode).additionalItems }),
      };

      if (expanded) {
        if (Array.isArray(schema.items)) {
          for (const [i, property] of schema.items.entries()) {
            yield* renderSchema(property, dereferencedSchema, options, {
              level: level + 1,
              path: [...path, 'items', i],
            });
          }
        } else if (baseNode.subtype === 'object' && schema.items) {
          yield* getProperties(schema.items, dereferencedSchema, options, {
            ...meta,
            path: [...path, 'items'],
          });
        } else if (baseNode.subtype === 'array' && schema.items) {
          yield* renderSchema(schema.items, dereferencedSchema, options, {
            level: level + 1,
            path,
          });
        }
      }
    } else if ('properties' in baseNode) {
      // special case :P, it's
      yield {
        ...baseNode,
        expanded,
        ...((node as IObjectNode).additionalProperties && {
          additional: (node as IObjectNode).additionalProperties,
        }),
      };

      if (expanded) {
        yield* getProperties(schema, dereferencedSchema, options, {
          ...meta,
          path: [...path, 'properties'],
        });

        yield* getPatternProperties(schema, dereferencedSchema, options, {
          ...meta,
          path: [...path, 'patternProperties'],
        });
      }
    } else {
      yield baseNode;
    }
  }
};

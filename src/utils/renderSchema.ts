import { JSONSchema4 } from 'json-schema';
import _isEmpty = require('lodash/isEmpty');
import { IArrayNode, IObjectNode, ITreeNodeMeta, SchemaKind, SchemaTreeListNode } from '../types';
import { isCombiner } from './isCombiner';
import { isRef } from './isRef';
import { lookupRef } from './lookupRef';
import { walk } from './walk';

type Walker = (
  schema: JSONSchema4,
  dereferencedSchema: JSONSchema4 | undefined,
  level?: number,
  meta?: ITreeNodeMeta
) => IterableIterator<SchemaTreeListNode>;

const getProperties: Walker = function*(schema, dereferencedSchema, level = 0, meta) {
  if (schema.properties !== undefined) {
    const { path } = meta!;
    for (const [prop, property] of Object.entries(schema.properties)) {
      yield* renderSchema(property, dereferencedSchema, level + 1, {
        name: prop,
        required: Array.isArray(schema.required) && schema.required.includes(prop),
        path: [...path, prop],
      });
    }
  }
};

const getPatternProperties: Walker = function*(schema, dereferencedSchema, level = 0, meta) {
  if (schema.patternProperties !== undefined) {
    const { path } = meta!;
    for (const [prop, property] of Object.entries(schema.patternProperties)) {
      yield* renderSchema(property, dereferencedSchema, level + 1, {
        name: prop,
        path: [...path, prop],
        pattern: true,
      });
    }
  }
};

export const renderSchema: Walker = function*(schema, dereferencedSchema, level = 0, meta = { path: [] }) {
  const { path } = meta;

  for (const node of walk(schema)) {
    const baseNode: SchemaTreeListNode = {
      id: node.id,
      level,
      name: '',
      metadata: {
        ...node,
        ...meta,
        ...(schema.items !== undefined && !Array.isArray(schema.items) && { subtype: schema.items.type }),
        path,
      },
    };

    if (isRef(node)) {
      const resolved = lookupRef(path, dereferencedSchema);
      if (resolved) {
        yield* renderSchema(resolved, dereferencedSchema, level, {
          ...meta,
          inheritedFrom: node.$ref,
        });
      } else {
        yield {
          ...baseNode,
          metadata: {
            ...baseNode.metadata,
            $ref: node.$ref,
          },
        } as SchemaTreeListNode;
      }
    } else if (isCombiner(node)) {
      yield {
        ...baseNode,
        canHaveChildren: true,
      };

      if (node.properties !== undefined) {
        const isConditionalCombiner = node.combiner === 'anyOf' || node.combiner === 'oneOf';
        for (const [i, property] of node.properties.entries()) {
          yield* renderSchema(property, dereferencedSchema, level + 1, {
            showDivider: isConditionalCombiner && i !== 0,
            path: [...path, 'properties', i],
          });
        }
      }
    } else if (node.type === SchemaKind.Array) {
      yield {
        ...baseNode,
        ...('items' in node &&
          !_isEmpty(node.items) &&
          !('subtype' in baseNode.metadata!) && { canHaveChildren: true }),
        metadata: {
          ...baseNode.metadata,
          // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.3.1.2
          ...(!('subtype' in baseNode) &&
            (node as IArrayNode).additionalItems && { additional: (node as IArrayNode).additionalItems }),
        },
      } as SchemaTreeListNode;

      if (Array.isArray(schema.items)) {
        for (const [i, property] of schema.items.entries()) {
          yield* renderSchema(property, dereferencedSchema, level + 1, {
            path: [...path, 'items', i],
          });
        }
      } else if (meta.subtype === 'object' && schema.items) {
        yield* getProperties(schema.items, dereferencedSchema, level + 1, {
          ...meta,
          path: [...path, 'items'],
        });
      } else if (meta.subtype === 'array' && schema.items) {
        yield* renderSchema(schema.items, dereferencedSchema, level + 1, {
          path,
        });
      }
    } else if ('properties' in node) {
      // special case :P, it's
      yield {
        ...baseNode,
        ...('properties' in node && !_isEmpty(node.properties) && { canHaveChildren: true }),
        metadata: {
          ...baseNode.metadata,
          ...((node as IObjectNode).additionalProperties && {
            additional: (node as IObjectNode).additionalProperties,
          }),
        },
      } as SchemaTreeListNode;

      yield* getProperties(schema, dereferencedSchema, level, {
        path: [...path, 'properties'],
      });

      yield* getPatternProperties(schema, dereferencedSchema, level, {
        path: [...path, 'patternProperties'],
      });
    } else {
      yield baseNode;
    }
  }
};

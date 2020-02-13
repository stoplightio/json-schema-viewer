import { isLocalRef } from '@stoplight/json';
import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';
import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { IArrayNode, IObjectNode, SchemaKind, SchemaTreeListNode } from '../types';
import { getPrimaryType } from '../utils/getPrimaryType';
import { isCombinerNode, isRefNode } from '../utils/guards';
import { isCombiner } from '../utils/isCombiner';
import { MetadataStore } from './metadata';
import { walk } from './walk';

export type WalkingOptions = {
  depth?: number;
};

export type Walker = (
  schema: JSONSchema4,
  parent: TreeListParentNode,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
) => void;

export const populateTree: Walker = (schema, parent, level, path, options) => {
  if (typeof schema !== 'object' || schema === null) return;
  if (options !== null && options.depth !== void 0 && level >= options.depth) return;

  for (const node of walk(schema)) {
    const treeNode: SchemaTreeListNode = {
      id: node.id,
      name: '',
      parent,
    };

    parent.children.push(treeNode);
    MetadataStore[treeNode.id] = {
      schema: node,
      path,
    };

    if (isRefNode(node) && isLocalRef(node.$ref) && node.$ref !== '#') {
      (treeNode as TreeListParentNode).children = [];
    } else if (isCombinerNode(node)) {
      if (node.properties !== void 0) {
        (treeNode as TreeListParentNode).children = [];

        for (const [i, property] of node.properties.entries()) {
          if ('type' in node) {
            node.properties[i] = {
              ...property,
              type: property.type || node.type,
            };
          }

          populateTree(
            node.properties[i],
            treeNode as TreeListParentNode,
            level + 1,
            [...path, node.combiner, i],
            options,
          );
        }
      }
    } else {
      switch (getPrimaryType(node)) {
        case SchemaKind.Array:
          processArray(treeNode, node as IArrayNode, level, path, options);
          break;
        case SchemaKind.Object:
          processObject(treeNode, node as IObjectNode, level, path, options);
          break;
      }
    }
  }

  return;
};

function processArray(
  node: TreeListNode,
  schema: IArrayNode,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
): TreeListNode {
  if (Array.isArray(schema.items)) {
    const children: TreeListNode[] = [];
    (node as TreeListParentNode).children = children;
    for (const [i, property] of schema.items.entries()) {
      const child = populateTree(property, node as TreeListParentNode, level + 1, [...path, 'items', i], options);
      if (child !== void 0) {
        children.push(child);
      }
    }
  } else if (schema.items !== void 0) {
    const subtype = getPrimaryType(schema.items);
    switch (subtype) {
      case SchemaKind.Object:
        return processObject(node, schema.items as IObjectNode, level + 1, [...path, 'items'], options);
      case SchemaKind.Array:
        return processArray(node, schema.items as IObjectNode, level + 1, [...path, 'items'], options);
      default:
        if (typeof subtype === 'string' && isCombiner(subtype)) {
          return processArray(node, schema.items as IObjectNode, level + 1, [...path, 'items'], options);
        }
    }
  }

  return node;
}

function processObject(
  node: TreeListNode,
  schema: IObjectNode,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
): TreeListNode {
  const children: TreeListNode[] = [];

  if (schema.properties !== void 0) {
    (node as TreeListParentNode).children = children;

    for (const [prop, property] of Object.entries(schema.properties)) {
      const child = populateTree(
        property,
        node as TreeListParentNode,
        level + 1,
        [...path, 'properties', prop],
        options,
      );
      if (child !== void 0) {
        children.push(child);
      }
    }
  }

  if (schema.patternProperties !== void 0) {
    (node as TreeListParentNode).children = children;

    for (const [prop, property] of Object.entries(schema.patternProperties)) {
      const child = populateTree(
        property,
        node as TreeListParentNode,
        level + 1,
        [...path, 'patternProperties', prop],
        options,
      );
      if (child !== void 0) {
        children.push(child);
      }
    }
  }

  return node;
}

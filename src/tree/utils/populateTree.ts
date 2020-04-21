import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';
import { JsonPath, Optional } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isObject as _isObject } from 'lodash';
import { IArrayNode, IObjectNode, SchemaKind, SchemaNode, SchemaTreeListNode } from '../../types';
import { mergeAllOf } from '../../utils';
import { getCombiner } from '../../utils/getCombiner';
import { getPrimaryType } from '../../utils/getPrimaryType';
import { hasRefItems, isCombinerNode, isRefNode } from '../../utils/guards';
import { metadataStore } from '../metadata';
import { walk } from './walk';

export type WalkerRefResolver = (path: JsonPath | null, $ref: string) => JSONSchema4;

export type WalkingOptions = {
  mergeAllOf: boolean;
  onNode?(fragment: JSONSchema4, node: SchemaNode, parentTreeNode: TreeListNode, level: number): boolean | void;
  stepIn?: boolean;
  resolveRef: WalkerRefResolver;
};

export type Walker = (
  schema: Optional<JSONSchema4 | null>,
  parent: TreeListParentNode,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
) => undefined;

export const populateTree: Walker = (schema, parent, level, path, options): undefined => {
  if (!_isObject(schema)) return;

  for (const { node, fragment } of walk(schema)) {
    if (options !== null && options.onNode !== void 0 && !options.onNode(fragment, node, parent, level)) continue;

    const treeNode: SchemaTreeListNode = {
      id: node.id,
      name: '',
      parent,
    };

    parent.children.push(treeNode);
    metadataStore.set(treeNode, {
      schemaNode: node,
      schema: fragment,
      path,
    });

    if (isRefNode(node) && node.$ref !== null) {
      (treeNode as TreeListParentNode).children = [];
    } else if (!isCombinerNode(node)) {
      switch (getPrimaryType(node)) {
        case SchemaKind.Array:
          processArray(treeNode, node as IArrayNode, level, path, options);
          break;
        case SchemaKind.Object:
          processObject(treeNode, node as IObjectNode, level, path, options);
          break;
      }
    } else if (node.combiner === 'allOf' && options?.mergeAllOf) {
      try {
        const merged = mergeAllOf(fragment, options.resolveRef);
        parent.children.pop();
        populateTree(merged, parent, level, path, options);
      } catch (ex) {
        if (Array.isArray(fragment.allOf)) {
          (treeNode as TreeListParentNode).children = [];
          bailAllOf(treeNode as TreeListParentNode, fragment, level + 1, [...path, 'allOf'], options);
        }
      }
    } else if (_isObject(node.properties)) {
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
  }

  return;
};

function processArray(
  node: SchemaTreeListNode,
  schema: IArrayNode,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
): SchemaTreeListNode {
  if (hasRefItems(schema) && schema.items.$ref) {
    (node as TreeListParentNode).children = [];
  } else if (Array.isArray(schema.items)) {
    const children: SchemaTreeListNode[] = [];
    (node as TreeListParentNode).children = children;
    for (const [i, property] of schema.items.entries()) {
      const child = populateTree(property, node as TreeListParentNode, level + 1, [...path, 'items', i], options);
      if (child !== void 0) {
        children.push(child);
      }
    }
  } else if (_isObject(schema.items)) {
    const subtype = getPrimaryType(schema.items);
    switch (subtype) {
      case SchemaKind.Object:
        return processObject(node, schema.items as IObjectNode, level, [...path, 'items'], options);
      case SchemaKind.Array:
        return processArray(node, schema.items as IObjectNode, level, [...path, 'items'], options);
      default:
        const combiner = getCombiner(schema.items);
        if (combiner) {
          (node as TreeListParentNode).children = [];
          populateTree(schema.items, node as TreeListParentNode, level, [...path, 'items'], options);
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

  if (_isObject(schema.properties)) {
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

  if (_isObject(schema.patternProperties)) {
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

function bailAllOf(
  node: TreeListParentNode,
  schema: JSONSchema4,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
) {
  if (Array.isArray(schema.allOf)) {
    for (const [i, item] of schema.allOf.entries()) {
      populateTree(item, node, level, [...path, i], options);
    }
  }
}

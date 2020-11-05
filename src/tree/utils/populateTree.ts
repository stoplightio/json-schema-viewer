import { TreeListNode, TreeListParentNode } from '@stoplight/tree-list';
import { JsonPath, Optional } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isObject as _isObject } from 'lodash';

import { IArrayNode, IObjectNode, SchemaKind, SchemaNode, SchemaTreeListNode } from '../../types';
import { generateId } from '../../utils/generateId';
import { getPrimaryType } from '../../utils/getPrimaryType';
import { isCombinerNode, isRefNode } from '../../utils/guards';
import { getNodeMetadata, getSchemaNodeMetadata, metadataStore } from '../metadata';
import { createErrorTreeNode } from './createErrorTreeNode';
import { mergeAllOf } from './mergeAllOf';
import { mergeOneOrAnyOf } from './mergeOneOrAnyOf';
import { processNode, walk } from './walk';

export type WalkerRefResolver = (path: JsonPath | null, $ref: string) => JSONSchema4;

export type WalkingOptions = {
  mergeAllOf: boolean;
  onNode?(fragment: JSONSchema4, node: SchemaNode, parentTreeNode: TreeListNode, level: number): boolean | void;
  stepIn?: boolean;
  resolveRef: WalkerRefResolver;
  shouldResolveEagerly: boolean;
};

export type Walker = (
  schema: Optional<JSONSchema4 | null>,
  parent: TreeListParentNode,
  level: number,
  path: JsonPath,
  options: WalkingOptions,
) => undefined;

export const populateTree: Walker = (schema, parent, level, path, options): undefined => {
  const actualSchema = prepareSchema(schema, parent, path, options);

  if (!_isObject(actualSchema)) return;

  for (const { node, fragment } of walk(actualSchema)) {
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
      processRef(treeNode, node as JSONSchema4, level, path, options);
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
      if ('oneOf' in fragment || 'anyOf' in fragment) {
        parent.children.pop();
        continue;
      }

      try {
        const merged = mergeAllOf(fragment, path, options);
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

      if (node.combiner === 'oneOf' || node.combiner === 'anyOf') {
        try {
          node.properties = mergeOneOrAnyOf(fragment, node.combiner, path, options);
        } catch {
          // merging failed, let's try render what we've got
        }
      }

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
  options: WalkingOptions,
): SchemaTreeListNode {
  const items = prepareSchema(schema.items, node, path, options);

  if (!_isObject(items)) return node;

  if (items !== schema.items) {
    // we need to update the stored metadata to make sure the subtype of given array correctly inferred by Property component
    const metadata = getNodeMetadata(node);
    if ('schemaNode' in metadata) {
      (metadata.schemaNode as IArrayNode).items = items;
    }
  }

  if ('$ref' in items) {
    processRef(node, items, level, path, options);
  } else if (Array.isArray(items)) {
    const children: SchemaTreeListNode[] = [];
    (node as TreeListParentNode).children = children;
    for (const [i, property] of items.entries()) {
      const child = populateTree(property, node as TreeListParentNode, level + 1, [...path, 'items', i], options);
      if (child !== void 0) {
        children.push(child);
      }
    }
  } else {
    const children: TreeListNode[] = [];
    (node as TreeListParentNode).children = children;
    populateTree(items, node as TreeListParentNode, level, [...path, 'items'], options);

    // optional flattening
    if (children.length === 1) {
      let schemaNode;
      try {
        ({ schemaNode } = getSchemaNodeMetadata(children[0]));
      } catch {
        return node;
      }

      if (!('children' in children[0])) {
        // we'll render this in subtype next to array, i.e. array[subtype], so let's get rid of these redundant nodes
        // @ts-ignore
        delete node.children;
      } else if (!('combiner' in schemaNode)) {
        for (const child of children[0].children) {
          // re-parenting
          child.parent = node as TreeListParentNode;
        }

        children.splice(0, children.length, ...children[0].children);
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
  options: WalkingOptions,
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

function processRef(
  node: TreeListNode,
  schema: JSONSchema4,
  level: number,
  path: JsonPath,
  options: WalkingOptions | null,
) {
  (node as TreeListParentNode).children = [];
  try {
    const resolved = resolveSchema(schema, path, options);
    if (_isObject(resolved) && typeof resolved.title === 'string') {
      const { schemaNode } = getSchemaNodeMetadata(node);
      schemaNode.title = resolved.title;
    }
  } catch {
    // resolving failed, nothing bad. We just won't have the title
  }
}

function bailAllOf(
  node: TreeListParentNode,
  schema: JSONSchema4,
  level: number,
  path: JsonPath,
  options: WalkingOptions,
) {
  if (Array.isArray(schema.allOf)) {
    for (const [i, item] of schema.allOf.entries()) {
      populateTree(item, node, level, [...path, i], options);
    }
  }
}

function resolveSchema(schema: Optional<JSONSchema4 | null>, path: JsonPath, options: WalkingOptions | null) {
  if (!_isObject(schema) || options === null || !('$ref' in schema) || typeof schema.$ref !== 'string') {
    return schema;
  }

  const resolved = options.resolveRef(path, schema.$ref);
  return _isObject(resolved) ? resolved : schema;
}

function prepareSchema(
  schema: Optional<JSONSchema4 | null>,
  node: TreeListNode,
  path: JsonPath,
  options: WalkingOptions | null,
): Optional<JSONSchema4 | null> {
  if (options === null || !options.shouldResolveEagerly) return schema;

  try {
    return resolveSchema(schema, path, options);
  } catch (ex) {
    const treeNode: SchemaTreeListNode = {
      id: generateId(),
      name: '',
      parent: node as TreeListParentNode,
      children: [],
    };

    (node as TreeListParentNode).children.push(treeNode);
    metadataStore.set(treeNode, {
      schemaNode: processNode(schema || {}).next().value,
      schema: schema || {},
      path,
    });

    treeNode.children.push(createErrorTreeNode(treeNode, ex.message));

    return null;
  }
}

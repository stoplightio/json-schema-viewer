import type { SchemaNode } from '@stoplight/json-schema-tree';
// @ts-expect-error: no types
import * as fnv from 'fnv-plus';

// for easier debugging the values going into hash
let SKIP_HASHING = false;

export const setSkipHashing = (skip: boolean) => {
  SKIP_HASHING = skip;
};

export const hash = (value: string, skipHashing: boolean = SKIP_HASHING): string => {
  // Never change this, as it would affect how the default stable id is generated, and cause mismatches with whatever
  // we already have stored in our DB etc.
  return skipHashing ? value : fnv.fast1a52hex(value);
};

export const getNodeId = (node: SchemaNode, parentId?: string): string => {
  const nodeId = node.fragment?.['x-stoplight']?.id;
  if (nodeId) return nodeId;

  const key = node.path[node.path.length - 1];

  return hash(['schema_property', parentId, String(key)].join('-'));
};

export const getOriginalNodeId = (node: SchemaNode, parentId?: string): string => {
  // @ts-expect-error originalFragment does exist...
  const nodeId = node.originalFragment?.['x-stoplight']?.id;
  if (nodeId) return nodeId;

  const key = node.path[node.path.length - 1];

  return hash(['schema_property', parentId, String(key)].join('-'));
};

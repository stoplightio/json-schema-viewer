import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import { Dictionary, JsonPath } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { SchemaNode } from './node';

export enum SchemaNodeKind {
  Any = 'any',
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}

export enum SchemaCombinerName {
  AllOf = 'allOf',
  AnyOf = 'anyOf',
  OneOf = 'oneOf',
}

export type JSONSchema4Annotations = 'title' | 'description' | 'default' | 'examples';

export type JSONSchema4Metadata = 'id' | '$schema';

export type SchemaFragment = Dictionary<unknown, keyof JSONSchema4>;


export type WalkerRefResolver = (path: JsonPath | null, $ref: string) => JSONSchema4;

export type WalkingOptions = {
  mergeAllOf: boolean;
  onNode?(fragment: JSONSchema4, node: SchemaNode, parentTreeNode: TreeListNode, level: number): boolean | void;
  stepIn?: boolean;
  resolveRef: WalkerRefResolver;
  shouldResolveEagerly: boolean;
};

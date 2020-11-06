import { Dictionary, JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { SchemaNode } from './nodes/types';

export type SchemaFragment = Dictionary<unknown, keyof JSONSchema4>;

export type WalkerRefResolver = (path: JsonPath | null, $ref: string) => JSONSchema4;

export type WalkingOptions = {
  mergeAllOf: boolean;
  onNode?(node: SchemaNode, level: number): boolean | void;
  stepIn?: boolean;
  resolveRef: WalkerRefResolver;
  shouldResolveEagerly: boolean;
};

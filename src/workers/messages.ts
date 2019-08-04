import { JSONSchema4 } from 'json-schema';
import { SchemaTreeListNode } from '../types';

export type ComputeSchemaMessage = {
  instanceId: string;
  schema: JSONSchema4;
};

export type RenderedSchemaMessage = {
  instanceId: string;
  nodes: SchemaTreeListNode[];
};


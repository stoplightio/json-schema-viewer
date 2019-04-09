import { IRefNode, SchemaNode } from '../types';

export const isRef = (node: SchemaNode): node is IRefNode => '$ref' in node;

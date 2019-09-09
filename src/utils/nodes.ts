import { ICombinerNode, IRefNode, SchemaNode } from '../types';

export const isRefNode = (node: SchemaNode): node is IRefNode => '$ref' in node;

export const isCombinerNode = (node: SchemaNode): node is ICombinerNode => 'combiner' in node;

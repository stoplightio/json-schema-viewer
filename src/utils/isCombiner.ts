import { ICombinerNode, SchemaNode } from '../types';

export const isCombiner = (node: SchemaNode): node is ICombinerNode => 'combiner' in node;

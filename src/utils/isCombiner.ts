import { ICombinerNode, SchemaNode } from '../renderers/types';

export const isCombiner = (node: SchemaNode): node is ICombinerNode => 'combiner' in node;

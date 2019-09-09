import { JSONSchema4CombinerName } from '../types';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isCombiner = (type: string): type is JSONSchema4CombinerName => combinerTypes.includes(type);

import { JSONSchemaCombinerName } from '../types';

const combinerTypes = ['allOf', 'oneOf', 'anyOf'];

export const isCombiner = (type: string): type is JSONSchemaCombinerName => combinerTypes.includes(type);

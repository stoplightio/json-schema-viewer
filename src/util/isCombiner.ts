import { ISchema } from '@stoplight/types';

export const isCombiner = (prop: ISchema) => !!(prop.allOf || prop.anyOf || prop.oneOf);

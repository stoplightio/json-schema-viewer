import { IProp, IResolvedProp } from '../types';

export const isCombiner = (prop: IProp | IResolvedProp) => !!(prop.allOf || prop.anyOf || prop.oneOf);

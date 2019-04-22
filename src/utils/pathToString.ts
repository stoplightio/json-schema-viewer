import { JsonPath } from '@stoplight/types';

export const pathToString = (path: JsonPath) => path.join('.');

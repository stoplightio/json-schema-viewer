import { JSONSchema4 } from 'json-schema';

import { SchemaKind } from '../../types';
import { getCombiners } from '../../utils/getCombiners';
import { getPrimaryType } from '../../utils/getPrimaryType';

export const canStepIn = (fragment: JSONSchema4) => {
  if (getCombiners(fragment) !== void 0) {
    return true;
  }

  const type = getPrimaryType(fragment);
  return type === SchemaKind.Array || type === SchemaKind.Object;
};

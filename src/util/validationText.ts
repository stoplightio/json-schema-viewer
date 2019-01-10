import { IProp, IResolvedProp } from '../types';
import { isCombiner } from './isCombiner';
import { pickValidations } from './pickValidations';

export const validationText = (prop: IProp | IResolvedProp) => {
  if (!isCombiner(prop)) {
    const validationCount = Object.keys(pickValidations(prop)).length;

    if (validationCount) {
      return `${validationCount} validation${validationCount > 1 ? 's' : ''}`;
    }
  }

  return '';
};

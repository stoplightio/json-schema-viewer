import isEmpty = require('lodash/isEmpty');
import merge = require('lodash/merge');
import omit = require('lodash/omit');

export const pickValidations = (prop: any) => {
  const validations = {};
  if (prop.enum && prop.enum.join) {
    validations['Allowed Values'] = prop.enum.join(', ');
  } else if (prop.enum) {
    validations['Allowed Values'] = prop.enum;
  } else if (prop.items && !isEmpty(prop.items.enum)) {
    validations['Allowed Values'] = prop.items.enum.join(', ');
  }

  merge(
    validations,
    omit(
      prop,
      'title',
      'description',
      'type',
      'enum',
      'properties',
      'items',
      'additionalProperties',
      '$ref',
      '_active',
      '_isOpen',
      'required',
      'xml',
      'patternProperties',
      '__inheritedFrom',
      '__error'
    )
  );

  return validations;
};

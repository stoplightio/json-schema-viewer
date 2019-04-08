import { Dictionary } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import _flatMap = require('lodash/flatMap');
import _pick = require('lodash/pick');

export const COMMON_VALIDATION_TYPES = [
  'enum', // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.5.1
  'format', // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-7
];

const VALIDATION_TYPES = {
  string: ['minLength', 'maxLength', 'pattern'],
  number: ['multipleOf', 'minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum'],
  object: ['additionalProperties', 'minProperties', 'maxProperties'],
  array: ['additionalItems', 'minItems', 'maxItems', 'uniqueItems'],
};

function getTypeValidations(type: JSONSchema4TypeName | JSONSchema4TypeName[]): string[] {
  if (Array.isArray(type)) {
    return _flatMap<JSONSchema4TypeName, string>(type, getTypeValidations);
  }

  return VALIDATION_TYPES[type] || [];
}

export const getValidations = (node: JSONSchema4): Dictionary<unknown> => {
  const extraValidations = node.type && getTypeValidations(node.type);
  return {
    ..._pick(node, COMMON_VALIDATION_TYPES),
    ...(extraValidations && _pick(node, extraValidations)),
  };
};

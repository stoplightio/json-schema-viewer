import { Dictionary, Optional } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { flatMap as _flatMap, pick as _pick } from 'lodash';

export const COMMON_VALIDATION_TYPES = [
  'enum', // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.5.1
  'format',
  'default',
  'example',
  'nullable',
  'discriminator',
  'readOnly',
  'writeOnly',
  'xml',
  'externalDocs',
];

const VALIDATION_TYPES = {
  string: ['minLength', 'maxLength', 'pattern'],
  number: ['multipleOf', 'minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum'],
  get integer() {
    return this.number;
  },
  object: ['additionalProperties', 'minProperties', 'maxProperties'],
  array: ['additionalItems', 'minItems', 'maxItems', 'uniqueItems'],
};

function getDeprecatedValue(node: JSONSchema4): Optional<boolean> {
  if ('x-deprecated' in node) {
    return !!node['x-deprecated'];
  }

  if ('deprecated' in node) {
    return !!node.deprecated;
  }

  return;
}

function getTypeValidations(type: JSONSchema4TypeName | JSONSchema4TypeName[]): string[] {
  if (Array.isArray(type)) {
    return _flatMap(type, getTypeValidations);
  }

  return VALIDATION_TYPES[type] || [];
}

export const getValidations = (node: JSONSchema4): Dictionary<unknown> => {
  const extraValidations = node.type && getTypeValidations(node.type);
  const deprecated = getDeprecatedValue(node);
  return {
    ..._pick(node, COMMON_VALIDATION_TYPES),
    ...(extraValidations && _pick(node, extraValidations)),
    ...(deprecated !== void 0 && { deprecated }),
  };
};

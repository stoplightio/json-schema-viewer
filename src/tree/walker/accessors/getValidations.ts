import { Dictionary, Optional } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { flatMap as _flatMap, pick as _pick } from 'lodash';

export const COMMON_VALIDATION_TYPES = [
  'enum', // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.5.1
  'format', // https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-7
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

function getTypeValidations(fragment: JSONSchema4TypeName | JSONSchema4TypeName[]): string[] {
  if (Array.isArray(fragment)) {
    return _flatMap(fragment, getTypeValidations);
  }

  return VALIDATION_TYPES[fragment] || [];
}

export const getValidations = (fragment: JSONSchema4): Dictionary<unknown> => {
  const extraValidations = fragment.type && getTypeValidations(fragment.type);
  const deprecated = getDeprecatedValue(fragment);
  return {
    ..._pick(fragment, COMMON_VALIDATION_TYPES),
    ...(extraValidations && _pick(fragment, extraValidations)),
    ...(deprecated !== void 0 && { deprecated }),
  };
};

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

const OAS_FORMATS = {
  int32: {
    minimum: 0 - Math.pow(2, 31),
    maximum: Math.pow(2, 31) - 1,
  },
  int64: {
    minimum: 0 - Math.pow(2, 63),
    maximum: Math.pow(2, 63) - 1,
  },
  float: {
    minimum: 0 - Math.pow(2, 128),
    maximum: Math.pow(2, 128) - 1,
  },
  double: {
    minimum: 0 - Number.MAX_VALUE,
    maximum: Number.MAX_VALUE,
  },
  byte: {
    pattern: '^[\\w\\d+\\/=]*$',
  },
};

function filterOutFormatValidations(values: Dictionary<unknown>) {
  const { format } = values;

  if (typeof format !== 'string' || !(format in OAS_FORMATS)) return values;

  const newValues = { ...values };

  for (const [key, value] of Object.entries(OAS_FORMATS[format])) {
    if (value === newValues[key]) {
      delete newValues[key];
    }
  }

  return newValues;
}

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
  return filterOutFormatValidations({
    ..._pick(node, COMMON_VALIDATION_TYPES),
    ...(extraValidations && _pick(node, extraValidations)),
    ...(deprecated !== void 0 && { deprecated }),
  });
};

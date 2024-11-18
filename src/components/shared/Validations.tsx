/* eslint-disable prettier/prettier */
import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { Flex, HStack, Text } from '@stoplight/mosaic';
import { Dictionary } from '@stoplight/types';
import capitalize from 'lodash/capitalize.js';
import keys from 'lodash/keys.js';
import omit from 'lodash/omit.js';
import pick from 'lodash/pick.js';
import uniq from 'lodash/uniq.js';
import * as React from 'react';

export interface IValidations {
  validations: Dictionary<unknown>;
  hideExamples?: boolean;
}

type ValidationFormat = {
  name: string;
  values: string[];
};

export const numberValidationNames = [
  'minimum',
  'maximum',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'exclusiveMinimum',
  'exclusiveMaximum',
];

type NumberValidationNames = typeof numberValidationNames;

const exampleValidationNames = ['examples'];

const excludedValidations = ['exclusiveMinimum', 'exclusiveMaximum', 'readOnly', 'writeOnly'];

const numberValidationFormatters: Record<string, (value: unknown) => string> = {
  minimum: value => `>= ${value}`,
  exclusiveMinimum: value => `> ${value}`,
  minItems: value => `>= ${value} items`,
  minLength: value => `>= ${value} characters`,
  maximum: value => `<= ${value}`,
  exclusiveMaximum: value => `< ${value}`,
  maxItems: value => `<= ${value} items`,
  maxLength: value => `<= ${value} characters`,
};

const createStringFormatter = (nowrap: boolean | undefined) => (value: unknown) => {
  return nowrap && typeof value === 'string' ? value : JSON.stringify(value);
};

const createValidationsFormatter =
  (name: string, options?: { exact?: boolean; nowrap?: boolean }) =>
  (value: unknown[] | unknown): ValidationFormat | null => {
    const values = Array.isArray(value) ? value : [value];
    if (values.length) {
      return {
        name: options?.exact ? name : values.length > 1 ? `${name}s` : `${name}`,
        values: values.map(createStringFormatter(options?.nowrap)),
      };
    }
    return null;
  };

const validationFormatters: Record<string, (value: unknown) => ValidationFormat | null> = {
  enum: createValidationsFormatter('Allowed value', { nowrap: true }),
  examples: createValidationsFormatter('Example', { nowrap: true }),
  multipleOf: createValidationsFormatter('Multiple of', { exact: true }),
  pattern: createValidationsFormatter('Match pattern', { exact: true, nowrap: true }),
  default: createValidationsFormatter('Default', { exact: true, nowrap: true }),
  style: createValidationsFormatter('Style', { exact: true, nowrap: true }),
};
// eslint-disable-next-line no-console
console.log('harshita')

const oasFormats = {

  int32: {
    minimum: 0 - 2 ** 31,
    maximum: 2 ** 31 - 1,
  },
  int64: {
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
  },
  float: {
    minimum: 0 - 2 ** 128,
    maximum: 2 ** 128 - 1,
  },
  double: {
    minimum: 0 - Number.MAX_VALUE,
    maximum: Number.MAX_VALUE,
  },
  byte: {
    pattern: '^[\\w\\d+\\/=]*$',
  },
};

function isOasFormat(format: string): format is keyof typeof oasFormats {
  return format in oasFormats;
}

function filterOutOasFormatValidations(format: string, values: Dictionary<unknown>) {
  if (!isOasFormat(format)) {
    return values;
  }

  const newValues = { ...values };

  for (const [key, value] of Object.entries(oasFormats[format])) {
    if (value === newValues[key]) {
      delete newValues[key];
    }
  }

  return newValues;
}

export const Validations: React.FunctionComponent<IValidations> = ({ validations, hideExamples }) => {
  const numberValidations = pick(validations, numberValidationNames);
  const keyValueValidations = omit(validations, [
    ...keys(numberValidations),
    ...excludedValidations,
    ...(hideExamples ? exampleValidationNames : []),
  ]);

  return (
    <>
      <NumberValidations validations={numberValidations} />
      <KeyValueValidations validations={keyValueValidations} />
    </>
  );
};

const NumberValidations = ({
  validations,
}: {
  validations: Partial<Record<NumberValidationNames[number], unknown>>;
}) => {
  const entries = Object.entries(validations);
  if (!entries.length) {
    return null;
  }
  return (
    <HStack color="muted" maxW="full" spacing={1} data-test="property-validation">
      {entries
        .map(([key, value]) => numberValidationFormatters[key](value))
        .map((value, i) => (
          <Value key={i} name={value} />
        ))}
    </HStack>
  );
};

const KeyValueValidations = ({ validations }: { validations: Dictionary<unknown> }) => (
  <>
    {keys(validations)
      .filter(key => Object.keys(validationFormatters).includes(key) && validations[key] !== void 0)
      .map(key => {
        const validation = validationFormatters[key](validations[key]);
        if (validation) {
          return <KeyValueValidation key={key} name={validation.name} values={validation.values} />;
        } else {
          return null;
        }
      })}
  </>
);

const KeyValueValidation = ({ name, values }: { name: string; values: string[] }) => {
  return (
    <HStack color="muted" spacing={2} alignItems="baseline" data-test="property-validation">
      <Text>{capitalize(name)}:</Text>

      <Flex flexWrap flex={1} style={{ gap: 4 }}>
        {uniq(values).map(value => (
          <Value key={value} name={value} />
        ))}
      </Flex>
    </HStack>
  );
};

const Value = ({ name }: { name: string }) => (
  <Text px={1} bg="canvas-tint" color="muted" border rounded wordBreak="all" maxW="full">
    {name}
  </Text>
);

export function validationCount(schemaNode: RegularNode) {
  const validations = getValidationsFromSchema(schemaNode);
  const validationKeys = keys(omit(validations, excludedValidations));
  return uniq(validationKeys.map(key => ([...numberValidationNames].includes(key) ? 'number' : key))).length;
}

const getArrayValidations = (schemaNode: RegularNode) => {
  if (schemaNode.children?.length === 1 && isRegularNode(schemaNode.children[0])) {
    if (schemaNode.children[0].enum !== null) {
      return { enum: schemaNode.children[0].enum };
    } else if (schemaNode.children[0].fragment.pattern !== void 0) {
      return { pattern: schemaNode.children[0].fragment.pattern };
    }
  }
  return null;
};

export function getValidationsFromSchema(schemaNode: RegularNode) {
  return {
    ...(schemaNode.enum !== null
      ? { enum: schemaNode.enum }
      : schemaNode.primaryType === 'array'
      ? // in case schemaNode is type: "array", check if its child has an additional validation
        getArrayValidations(schemaNode)
      : null),
    ...('annotations' in schemaNode
      ? {
          ...(schemaNode.annotations.default !== void 0 ? { default: schemaNode.annotations.default } : null),
          ...(schemaNode.annotations.examples ? { examples: schemaNode.annotations.examples } : null),
        }
      : null),
    ...getFilteredValidations(schemaNode),
  };
}

function getFilteredValidations(schemaNode: RegularNode) {
  if (schemaNode.format !== null) {
    return filterOutOasFormatValidations(schemaNode.format, schemaNode.validations);
  }

  return schemaNode.validations;
}

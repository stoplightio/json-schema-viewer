import { RegularNode } from '@stoplight/json-schema-tree';
import { Flex, Text } from '@stoplight/mosaic';
import { Dictionary } from '@stoplight/types';
import { capitalize, keys, omit, pick, pickBy, uniq } from 'lodash';
import * as React from 'react';

export interface IValidations {
  validations: Dictionary<unknown>;
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

const createValidationsFormatter = (name: string, options?: { exact?: boolean; nowrap?: boolean }) => (
  value: unknown[] | unknown,
): ValidationFormat | null => {
  const values = Array.isArray(value) ? value : [value];
  if (values.length) {
    return {
      name: options?.exact ? name : values.length > 1 ? `${name} values` : `${name} value`,
      values: values.map(createStringFormatter(options?.nowrap)),
    };
  }
  return null;
};

const validationFormatters: Record<string, (value: unknown) => ValidationFormat | null> = {
  ['const']: createValidationsFormatter('Allowed'),
  enum: createValidationsFormatter('Allowed'),
  examples: createValidationsFormatter('Example'),
  example: createValidationsFormatter('Example'),
  ['x-example']: createValidationsFormatter('Example'),
  multipleOf: createValidationsFormatter('Multiple of', { exact: true }),
  pattern: createValidationsFormatter('Match pattern', { exact: true, nowrap: true }),
  default: createValidationsFormatter('Default'),
};

export const Validations: React.FunctionComponent<IValidations> = ({ validations }) => {
  const numberValidations = pick(validations, numberValidationNames);
  const booleanValidations = omit(
    pickBy(validations, v => ['true', 'false'].includes(String(v))),
    excludedValidations,
  );
  const keyValueValidations = omit(validations, [
    ...keys(numberValidations),
    ...keys(booleanValidations),
    ...excludedValidations,
  ]);

  return (
    <>
      <NumberValidations validations={numberValidations} />
      <KeyValueValidations validations={keyValueValidations} />
      <NameValidations validations={booleanValidations} />
    </>
  );
};

const NumberValidations = ({
  validations,
  className,
}: {
  validations: Partial<Record<typeof numberValidationNames[number], unknown>>;
  className?: string;
}) => {
  const entries = Object.entries(validations);
  if (!entries.length) {
    return null;
  }
  return (
    <Flex my={2} color="muted">
      {entries
        .map(([key, value]) => numberValidationFormatters[key](value))
        .map((value, i) => (
          <Text key={i} mr={2} px={1} fontFamily="mono" border rounded="lg" className={className}>
            {value}
          </Text>
        ))}
    </Flex>
  );
};

const KeyValueValidations = ({ validations, className }: { validations: Dictionary<unknown>; className?: string }) => (
  <>
    {keys(validations)
      .filter(key => Object.keys(validationFormatters).includes(key))
      .map(key => {
        const validation = validationFormatters[key](validations[key]);
        if (validation) {
          return (
            <KeyValueValidation key={key} name={validation.name} values={validation.values} className={className} />
          );
        } else {
          return null;
        }
      })}
  </>
);

const KeyValueValidation = ({ className, name, values }: { className?: string; name: string; values: string[] }) => {
  return (
    <Flex flexWrap color="muted" my={2} className={className}>
      <Text fontWeight="light">{capitalize(name)}:</Text>
      {uniq(values).map(value => (
        <Text key={value} ml={2} px={1} fontFamily="mono" border rounded="lg" className={className}>
          {value}
        </Text>
      ))}
    </Flex>
  );
};

const NameValidations = ({ validations, className }: { validations: Dictionary<unknown>; className?: string }) => (
  <>
    {keys(validations)
      .filter(key => validations[key])
      .map(key => {
        return (
          <Flex key={key} flex={1} my={2}>
            <Text
              px={1}
              color="muted"
              fontFamily="mono"
              border
              rounded="lg"
              fontSize="sm"
              textTransform="capitalize"
              className={className}
            >
              {key}
            </Text>
          </Flex>
        );
      })}
  </>
);

export function validationCount(schemaNode: RegularNode) {
  const validations = getValidationsFromSchema(schemaNode);
  const validationKeys = keys(omit(validations, excludedValidations));
  return uniq(validationKeys.map(key => ([...numberValidationNames].includes(key) ? 'number' : key))).length;
}

export function getValidationsFromSchema(schemaNode: RegularNode) {
  return {
    ...(schemaNode.enum !== null ? { enum: schemaNode.enum } : null),
    ...('annotations' in schemaNode
      ? {
          ...(schemaNode.annotations.default ? { default: schemaNode.annotations.default } : null),
          ...(schemaNode.annotations.examples ? { examples: schemaNode.annotations.examples } : null),
          ...(schemaNode.annotations.const ? { const: schemaNode.annotations.const } : null),
          ...(schemaNode.annotations['x-example'] ? { ['x-example']: schemaNode.annotations['x-example'] } : null),
        }
      : null),
    ...schemaNode.validations,
  };
}

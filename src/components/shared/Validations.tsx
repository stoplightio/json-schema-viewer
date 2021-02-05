import { Dictionary, Primitive } from '@stoplight/types';
import { Box, Flex, Text } from '@stoplight/mosaic';
import { capitalize, keys, omit, pick, pickBy, uniq } from 'lodash';
import * as React from 'react';
import { RegularNode } from '@stoplight/json-schema-tree';

export interface IValidations {
  validations: Dictionary<unknown>;
}

const numberValidationNames = [
  'minimum',
  'maximum',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'exclusiveMinimum',
  'exclusiveMaximum',
];

const excludedValidations = [
  'exclusiveMinimum',
  'exclusiveMaximum',
  'readOnly',
  'writeOnly'
];

export const Validations: React.FunctionComponent<IValidations> = ({
  validations,
}) => {
  const numberValidations = pick(validations, numberValidationNames);
  const booleanValidations = omit(
    pickBy(validations, v => ['true', 'false'].includes(String(v))),
    excludedValidations,
  );
  const keyValueValidations = omit(validations, [...keys(numberValidations), ...keys(booleanValidations), ...excludedValidations]);

  return (
    <>
      <NumberValidations validations={numberValidations} />
      <KeyValueValidations validations={keyValueValidations} />
      <NameValidations validations={booleanValidations} />
    </>
  );
};

const NumberValidations = ({ validations, className }: { validations: Dictionary<unknown>; className?: string }) => {
  const values = keys(omit(validations, excludedValidations));
  if (!values.length) {
    return null;
  }
  return (
    <Flex my={2} color="muted">
      <Text fontWeight="light">Allowed values:</Text>
      {values.map(key => {
        let suffix;
        if (key.includes('Length')) {
          suffix = ' characters';
        } else if (key.includes('Items')) {
          suffix = ' items';
        } else {
          suffix = '';
        }

        const exclusive =
          (key === 'minimum' && validations.exclusiveMinimum) || (key === 'maximum' && validations.exclusiveMaximum)
            ? true
            : false;
        const sign = `${key.includes('min') ? '>' : '<'}${exclusive ? '' : '='}`;

        return (
          <Text key={key} ml={2} px={1} fontFamily="mono" border rounded="lg" className={className}>
            {`${sign} ${validations[key]}${suffix}`}
          </Text>
        );
      })}
    </Flex>
  )
};

const KeyValueValidations = ({ validations, className }: { validations: Dictionary<unknown>; className?: string }) => (
  <>
    {keys(validations)
      .filter(validation => validation !== 'format')
      .map(key => {
        return <KeyValueValidation key={key} name={key} value={validations[key]} className={className} />;
      })}
  </>
);

const KeyValueValidation = ({
  className,
  name,
  value,
}: {
  className?: string;
  name: string;
  value: Dictionary<unknown> | unknown[] | unknown;
}) => {
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    return (
      <>
        {keys(value).map(key => (
          <KeyValueValidation key={key} className={className} name={`${name}.${key}`} value={value[key]} />
        ))}
      </>
    );
  }
  const validation = Array.isArray(value) ? value : [value];
  return (
    <Flex flexWrap color="muted" my={2} className={className}>
      <Text fontWeight="light">{capitalize(name)}:</Text>
      {validation
        .filter(
          (v): v is Exclude<Primitive, null> | { value: string } =>
            typeof v !== 'object' || (typeof v === 'object' && v !== null && 'value' in v),
        )
        .map(v => {
          const value = typeof v === 'object' ? v.value : String(v);
          return (
            <Text key={value} ml={2} px={1} fontFamily="mono" border rounded="lg" className={className}>
              {value}
            </Text>
          );
        })}
    </Flex>
  );
};

const NameValidations = ({ validations, className }: { validations: Dictionary<unknown>; className?: string }) => (
  <>
    {keys(validations)
      .filter(key => validations[key])
      .map(key => {
        return (
          <Flex flex={1} my={2}>
            <Text key={key} px={1} color="muted" fontFamily="mono" border rounded="lg" fontSize="sm" textTransform="capitalize" className={className}>
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
  return uniq(validationKeys.map(key => [...numberValidationNames].includes(key) ? 'number' : key)).length;
}

export function getValidationsFromSchema(schemaNode: RegularNode) {
  return {
    ...(schemaNode.enum !== null ? { enum: schemaNode.enum } : null),
    ...('annotations' in schemaNode && schemaNode.annotations.default
      ? { default: schemaNode.annotations.default }
      : null),
    ...schemaNode.validations,
  };
}

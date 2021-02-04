import { Dictionary, Primitive } from '@stoplight/types';
import { Box, Flex } from '@stoplight/mosaic';
import { Tag } from '@stoplight/ui-kit';
import { capitalize, keys, omit, pick, pickBy, uniq } from 'lodash';
import * as React from 'react';
import cn from 'classnames';
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
    <Flex my={2} className="text-gray-5 dark:text-gray-3">
      Allowed values:
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
          <Box ml={2} key={key} className={cn('text-sm bp3-running-text break-all', className)}>
            <code>{`${sign} ${validations[key]}${suffix}`}</code>
          </Box>
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
    <Flex flexWrap className={cn('text-sm text-gray-5 dark:text-gray-3 my-2 bp3-running-text break-all', className)}>
      {capitalize(name)}:
      {validation
        .filter(
          (v): v is Exclude<Primitive, null> | { value: string } =>
            typeof v !== 'object' || (typeof v === 'object' && v !== null && 'value' in v),
        )
        .map(v => {
          const value = typeof v === 'object' ? v.value : String(v);
          return (
            <code className="ml-1 truncate" key={value}>
              {value}
            </code>
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
          <Tag key={key} className={cn('mt-2 mr-2 capitalize', className)} minimal>
            {key}
          </Tag>
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

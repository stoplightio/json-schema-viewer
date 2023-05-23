import { Story } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';

const defaultSchema = require('../__fixtures__/default-schema.json');
const allOfSchema = require('../__fixtures__/combiners/allOfs/base.json');
const allOfComplexSchema = require('../__fixtures__/combiners/allOfs/complex.json');
const oneOfWithArraySchema = require('../__fixtures__/combiners/oneof-with-array-type.json');
const oneOfWithArraySchema2 = require('../__fixtures__/combiners/oneof-within-array-item.json');
const oneOfWithMultiTypesSchema = require('../__fixtures__/combiners/oneof-with-multi-types.json');
const anyOfObject = require('../__fixtures__/combiners/anyOf.json');

export default {
  component: JsonSchemaViewer,
  argTypes: {},
};

const Template: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <JsonSchemaViewer schema={schema} {...args} />
);

export const SimpleAllOf = Template.bind({});
SimpleAllOf.args = { schema: allOfSchema as JSONSchema4 };

export const CircularAllOf = Template.bind({});
CircularAllOf.args = { schema: allOfComplexSchema as JSONSchema4 };

export const ArrayOneOf = Template.bind({});
ArrayOneOf.args = { schema: oneOfWithArraySchema as JSONSchema4, renderRootTreeLines: true };

export const ArrayOneOf2 = Template.bind({});
ArrayOneOf2.args = { schema: oneOfWithArraySchema2 as JSONSchema4, renderRootTreeLines: true };

export const OneOfMulti = Template.bind({});
OneOfMulti.args = { schema: oneOfWithMultiTypesSchema, renderRootTreeLines: true };

export const ObjectAnyOf = Template.bind({});
ObjectAnyOf.args = { schema: anyOfObject as JSONSchema4 };

import { Story } from '@storybook/react';
import { JSONSchema4, JSONSchema7 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';
import { defaultResolver } from '../utils/refResolver';

const defaultSchema = require('../__fixtures__/default-schema.json');
const refSchema = require('../__fixtures__/references/base.json');
const nullRefSchema = require('../__fixtures__/references/nullish.json');
const brokenRefArraySchema = require('../__fixtures__/arrays/of-refs.json');
const allOfRefSchema = require('../__fixtures__/references/allOfReference.json');
const fullAllOfRefDoc = require('../__fixtures__/references/fullAllOfReference.json');

export default {
  component: JsonSchemaViewer,
  argTypes: {},
};

const Template: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <JsonSchemaViewer schema={schema} {...args} />
);

export const Simple = Template.bind({});
Simple.args = { schema: refSchema as JSONSchema4 };

export const Nullish = Template.bind({});
Nullish.args = { schema: nullRefSchema as JSONSchema4 };

export const Broken = Template.bind({});
Broken.args = { schema: brokenRefArraySchema as JSONSchema4 };

export const RefResolverAllOfRef = Template.bind({});
RefResolverAllOfRef.args = {
  schema: allOfRefSchema as JSONSchema7,
  resolveRef: defaultResolver(fullAllOfRefDoc),
};

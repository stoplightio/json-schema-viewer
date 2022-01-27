import { Story } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';

const defaultSchema = require('../__fixtures__/default-schema.json');
const refSchema = require('../__fixtures__/references/base.json');
const nullRefSchema = require('../__fixtures__/references/nullish.json');
const brokenRefArraySchema = require('../__fixtures__/arrays/of-refs.json');

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

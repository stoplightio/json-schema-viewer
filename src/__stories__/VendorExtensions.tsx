import { Flex } from '@stoplight/mosaic';
import { Story } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';

const defaultSchema = require('../__fixtures__/default-schema.json');
const extensionsSchema = require('../__fixtures__/extensions/simple.json');

export default {
  component: JsonSchemaViewer,
  argTypes: {},
};

const Template: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <JsonSchemaViewer schema={schema} {...args} />
);

export const ExtensionRowSchema = Template.bind({});
ExtensionRowSchema.args = {
  schema: extensionsSchema as JSONSchema4,
  defaultExpandedDepth: Infinity,
  renderRootTreeLines: true,
  renderExtensionAddon: ({ nestingLevel, vendorExtensions }) => {
    if (nestingLevel < 1) {
      return null;
    }

    if (typeof vendorExtensions['x-stoplight'] === 'undefined') {
      return null;
    }

    return (
      <Flex h="full" alignItems="center">
        <strong>{JSON.stringify(vendorExtensions['x-stoplight'], null, 2)}</strong>
      </Flex>
    );
  },
};

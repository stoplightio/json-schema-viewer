import type { NodeHasChangedFn } from '@stoplight/types';
import { Story } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';

const defaultSchema = require('../__fixtures__/default-schema.json');
const simpleExample = require('../__fixtures__/diff/simple-example.json');
const rootRefExample = require('../__fixtures__/diff/root-ref.json');

export default {
  component: JsonSchemaViewer,
  argTypes: {},
};

const changed: Record<string, ReturnType<NodeHasChangedFn>> = {
  'age-id': { type: 'removed' },
  'list-id': { type: 'modified', selfAffected: true },
  'list-of-objects-id': { type: 'modified', isBreaking: true },
  'list-of-objects-items-friend-id': { type: 'modified', isBreaking: true },
  'list-of-objects-items-friend-name-id': { type: 'modified', selfAffected: true, isBreaking: true },
  'list-of-objects-items-friend-name-last-id': { type: 'added', isBreaking: true },
  'friend-id': { type: 'added', isBreaking: true },
  'address-street-id': { type: 'added' },
};
const nodeHasChanged: NodeHasChangedFn = ({ nodeId }) => {
  const change = changed[nodeId!];
  return change || false;
};

const Template: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <JsonSchemaViewer schema={schema} {...args} nodeHasChanged={nodeHasChanged} />
);

export const SimpleAllOf = Template.bind({});
SimpleAllOf.args = { schema: simpleExample as JSONSchema4 };

export const RootRef = Template.bind({});
RootRef.args = { schema: rootRefExample as JSONSchema4 };

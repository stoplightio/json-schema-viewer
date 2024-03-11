import { Story } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';

const defaultSchema = require('../__fixtures__/default-schema.json');
const boxFileSchema = require('../__fixtures__/real-world/box-file.json');
const githubIssueSchema = require('../__fixtures__/real-world/github-issue.json');

export default {
  component: JsonSchemaViewer,
  argTypes: {},
};

const Template: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <JsonSchemaViewer schema={schema} {...args} />
);

export const BoxFileSchema = Template.bind({});
BoxFileSchema.args = { schema: boxFileSchema as JSONSchema4, parentCrumbs: ['Box', 'File'], renderRootTreeLines: true };

export const GithubIssueSchema = Template.bind({});
GithubIssueSchema.args = {
  schema: githubIssueSchema as JSONSchema4,
  parentCrumbs: ['Github', 'Issue'],
  renderRootTreeLines: true,
};

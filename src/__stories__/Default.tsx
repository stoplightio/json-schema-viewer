import { Box, Button, Flex, InvertTheme } from '@stoplight/mosaic';
import { Story } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { JsonSchemaProps, JsonSchemaViewer } from '../components/JsonSchemaViewer';

const defaultSchema = require('../__fixtures__/default-schema.json');
const stressSchema = require('../__fixtures__/stress-schema.json');
const githubIssueSchema = require('../__fixtures__/real-world/github-issue.json');
const arrayOfComplexObjects = require('../__fixtures__/arrays/of-complex-objects.json');
const allOfComplexSchema = require('../__fixtures__/combiners/allOfs/complex.json');

export default {
  component: JsonSchemaViewer,
  argTypes: {},
};

const Template: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <JsonSchemaViewer schema={schema} {...args} />
);

export const Default = Template.bind({});

export const CustomRowAddon = Template.bind({});
CustomRowAddon.args = {
  renderRowAddon: ({ nestingLevel }) => {
    return nestingLevel == 1 ? (
      <Flex h="full" alignItems="center">
        <Button pl={1} mr={1} size="sm" appearance="minimal" icon="bullseye" />
        <Button pl={1} mr={1} size="sm" appearance="minimal">
          Expand All
        </Button>
      </Flex>
    ) : null;
  },
};

export const Expansions = Template.bind({});
Expansions.args = {
  schema: arrayOfComplexObjects as JSONSchema4,
  renderRootTreeLines: true,
  defaultExpandedDepth: 0,
};

export const ArrayOfObjects = Template.bind({});
ArrayOfObjects.args = { schema: arrayOfComplexObjects as JSONSchema4, renderRootTreeLines: true };

export const StressTest = Template.bind({});
StressTest.args = { schema: stressSchema as JSONSchema4, defaultExpandedDepth: 7 };

export const ErrorBoundary = Template.bind({});
ErrorBoundary.args = {
  schema: {
    'null (throws error)': null,
    'object (recovers from error)': defaultSchema,
  },
};

export const InvalidTypes = Template.bind({});
InvalidTypes.args = {
  schema: {
    type: 'object',
    // @ts-ignore
    properties: {
      id: {
        type: 'string',
      },
      address: {
        type: [
          // @ts-ignore
          'null',
          // @ts-ignore
          {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                format: 'uuid',
              },
            },
          },
        ],
      },
    },
  },
};
InvalidTypes.storyName = 'Invalid types';

export const DarkMode: Story<JsonSchemaProps> = ({ schema = defaultSchema as JSONSchema4, ...args }) => (
  <InvertTheme>
    <Box bg="canvas">
      <JsonSchemaViewer schema={schema} {...args} />
    </Box>
  </InvertTheme>
);

export const ExpandCollapseAll = Template.bind({});
ExpandCollapseAll.args = {
  showExpandAll: true,
  schema: githubIssueSchema as JSONSchema4,
};
ExpandCollapseAll.storyName = 'Expand/Collapse All';

export const CircularExpandCollapseAll = Template.bind({});
CircularExpandCollapseAll.args = {
  showExpandAll: true,
  maxRefDepth: 10,
  schema: allOfComplexSchema as JSONSchema4,
};

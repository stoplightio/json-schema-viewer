import { Button, Flex, InvertTheme, subscribeTheme } from '@stoplight/mosaic';
import { action } from '@storybook/addon-actions';
import { boolean, number, object, select, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JsonSchemaViewer, RowAddonRenderer } from '../';
import { Wrapper } from './utils/Wrapper';

const allOfSchema = require('../__fixtures__/combiners/allOfs/base.json');
const schema = require('../__fixtures__/default-schema.json');
const stressSchema = require('../__fixtures__/stress-schema.json');
const boxFileSchema = require('../__fixtures__/real-world/box-file.json');
const githubIssueSchema = require('../__fixtures__/real-world/github-issue.json');
const refSchema = require('../__fixtures__/references/base.json');
const nullRefSchema = require('../__fixtures__/references/nullish.json');
const brokenRefArraySchema = require('../__fixtures__/arrays/of-refs.json');
const oneOfWithArraySchema = require('../__fixtures__/combiners/oneof-with-array-type.json');
const oneOfWithArraySchema2 = require('../__fixtures__/combiners/oneof-within-array-item.json');
const arrayOfComplexObjects = require('../__fixtures__/arrays/of-complex-objects.json');

subscribeTheme({ mode: 'light' });

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('default', () => (
    <JsonSchemaViewer
      schema={schema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 0)}
      viewMode={select(
        'viewMode',
        {
          standalone: 'standalone',
          read: 'read',
          write: 'write',
        },
        'standalone',
      )}
      hideExamples={boolean('hideExamples', false)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('custom schema', () => (
    <JsonSchemaViewer
      schema={object('schema', {})}
      defaultExpandedDepth={number('defaultExpandedDepth', 0)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('custom row addon', () => {
    const customRowAddonRenderer: RowAddonRenderer = () => {
      return (
        <Flex h="full" alignItems="center">
          <Button pl={1} mr={1} size="sm" appearance="minimal" icon="issue" />
          <input type="checkbox" />
        </Flex>
      );
    };

    return (
      <JsonSchemaViewer
        schema={object('schema', schema as JSONSchema4)}
        onGoToRef={action('onGoToRef')}
        renderRowAddon={customRowAddonRenderer}
      />
    );
  })
  .add('array of objects', () => (
    <JsonSchemaViewer
      schema={arrayOfComplexObjects as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('stress-test schema', () => (
    <JsonSchemaViewer
      schema={stressSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('allOf-schema', () => (
    <JsonSchemaViewer
      schema={allOfSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('anyOf-array-schema', () => (
    <JsonSchemaViewer
      schema={oneOfWithArraySchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('anyOf-array-schema2', () => (
    <JsonSchemaViewer
      schema={oneOfWithArraySchema2 as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('error boundary', () => (
    <JsonSchemaViewer
      // @ts-ignore
      schema={select(
        'schema',
        {
          'null (throws error)': null,
          'object (recovers from error)': schema,
        },
        null,
      )}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('invalid types property pretty error message', () => (
    <JsonSchemaViewer
      schema={{
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
      }}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('dark', () => {
    return (
      <InvertTheme>
        <div style={{ height: '100vh' }}>
          <JsonSchemaViewer
            schema={schema as JSONSchema4}
            defaultExpandedDepth={number('defaultExpandedDepth', 2)}
            onGoToRef={action('onGoToRef')}
            className="sl-bg-canvas"
          />
        </div>
      </InvertTheme>
    );
  })
  .add('refs/normal', () => (
    <JsonSchemaViewer
      schema={refSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('refs/nullish', () => (
    <JsonSchemaViewer
      schema={nullRefSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('refs/broken', () => (
    <JsonSchemaViewer
      schema={brokenRefArraySchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('Box "File" Schema', () => (
    <JsonSchemaViewer
      schema={boxFileSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('Github "Issue" Schema', () => (
    <JsonSchemaViewer
      schema={githubIssueSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
    />
  ));

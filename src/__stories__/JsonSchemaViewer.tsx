import { Flex, Button, InvertTheme, subscribeTheme } from '@stoplight/mosaic';
import { action } from '@storybook/addon-actions';
import { boolean, number, object, select, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JsonSchemaViewer, RowRenderer, SchemaRow } from '../';
import { Wrapper } from './utils/Wrapper';

const allOfSchema = require('../__fixtures__/combiners/allOfs/base.json');
const schema = require('../__fixtures__/default-schema.json');
const stressSchema = require('../__fixtures__/stress-schema.json');

subscribeTheme({ mode: 'light' });

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('default', () => (
    <JsonSchemaViewer
      schema={schema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 0)}
      expanded={boolean('expanded', true)}
      onGoToRef={action('onGoToRef')}
      viewMode={select(
        'viewMode',
        {
          standalone: 'standalone',
          read: 'read',
          write: 'write',
        },
        'standalone',
      )}
    />
  ))
  .add('custom schema', () => (
    <JsonSchemaViewer
      schema={object('schema', {})}
      defaultExpandedDepth={number('defaultExpandedDepth', 0)}
      expanded={boolean('expanded', false)}
      onGoToRef={action('onGoToRef')}
      maxRows={number('maxRows', 5)}
      mergeAllOf={boolean('mergeAllOf', true)}
    />
  ))
  .add('custom row renderer', () => {
    const customRowRenderer: RowRenderer = (node, rowOptions) => {
      return (
        <>
          <SchemaRow treeListNode={node} rowOptions={rowOptions} />
          <Flex h="full" alignItems="center">
            <Button pl={1} mr={1} size="sm" appearance="minimal" icon="issue" />
            <input type="checkbox" />
          </Flex>
        </>
      );
    };

    return (
      <JsonSchemaViewer
        schema={object('schema', schema as JSONSchema4)}
        expanded={boolean('expanded', true)}
        onGoToRef={action('onGoToRef')}
        maxRows={number('maxRows', 5)}
        mergeAllOf={boolean('mergeAllOf', true)}
        rowRenderer={customRowRenderer}
      />
    );
  })
  .add('stress-test schema', () => (
    <>
      <div style={{ height: 345 }}>
        <JsonSchemaViewer
          schema={stressSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          expanded={boolean('expanded', false)}
          onGoToRef={action('onGoToRef')}
          maxRows={number('maxRows', 10)}
          mergeAllOf={boolean('mergeAllOf', true)}
        />
      </div>
      <div style={{ height: 345 }}>
        <JsonSchemaViewer
          schema={stressSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          expanded={boolean('expanded', false)}
          onGoToRef={action('onGoToRef')}
          maxRows={number('maxRows', 10)}
          mergeAllOf={boolean('mergeAllOf', true)}
        />
      </div>
    </>
  ))
  .add('allOf-schema', () => (
    <JsonSchemaViewer
      schema={allOfSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      mergeAllOf={boolean('mergeAllOf', true)}
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
      expanded={boolean('expanded', false)}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
      mergeAllOf={boolean('mergeAllOf', true)}
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
      expanded={boolean('expanded', false)}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      onGoToRef={action('onGoToRef')}
      mergeAllOf={boolean('mergeAllOf', true)}
    />
  ))
  .add('dark', () => {
    return (
      <InvertTheme>
        <div style={{ height: '100vh' }}>
          <JsonSchemaViewer
            schema={schema as JSONSchema4}
            defaultExpandedDepth={number('defaultExpandedDepth', 2)}
            expanded={boolean('expanded', false)}
            onGoToRef={action('onGoToRef')}
            mergeAllOf={boolean('mergeAllOf', true)}
          />
        </div>
      </InvertTheme>
    );
  });

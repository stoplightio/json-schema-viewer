import { InvertTheme, subscribeTheme } from '@stoplight/mosaic';
import { action } from '@storybook/addon-actions';
import { boolean, number, object, select, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JsonSchemaViewer } from '../';
import { Wrapper } from './utils/Wrapper';

const allOfSchema = require('../__fixtures__/combiners/allOfs/base.json');
const schema = require('../__fixtures__/default-schema.json');
const stressSchema = require('../__fixtures__/stress-schema.json');
const refSchema = require('../__fixtures__/references/base.json');
const nullRefSchema = require('../__fixtures__/references/nullish.json');
const brokenRefArraySchema = require('../__fixtures__/arrays/of-refs.json');

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
    />
  ))
  .add('custom schema', () => (
    <JsonSchemaViewer
      schema={object('schema', {})}
      defaultExpandedDepth={number('defaultExpandedDepth', 0)}
      maxRows={number('maxRows', 5)}
      mergeAllOf={boolean('mergeAllOf', true)}
    />
  ))
  .add('stress-test schema', () => (
    <>
      <div style={{ height: 345, overflowY: 'scroll' }}>
        <JsonSchemaViewer
          schema={stressSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          maxRows={number('maxRows', 10)}
          mergeAllOf={boolean('mergeAllOf', true)}
        />
      </div>
      <div style={{ height: 345, overflowY: 'scroll' }}>
        <JsonSchemaViewer
          schema={stressSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
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
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
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
            mergeAllOf={boolean('mergeAllOf', true)}
          />
        </div>
      </InvertTheme>
    );
  })
  .add('refs/normal', () => (
    <JsonSchemaViewer schema={refSchema as JSONSchema4} defaultExpandedDepth={number('defaultExpandedDepth', 2)} />
  ))
  .add('refs/nullish', () => (
    <JsonSchemaViewer schema={nullRefSchema as JSONSchema4} defaultExpandedDepth={number('defaultExpandedDepth', 2)} />
  ))
  .add('refs/broken', () => (
    <JsonSchemaViewer
      schema={brokenRefArraySchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
    />
  ));

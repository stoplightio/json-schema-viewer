import { Button, Checkbox, Icon } from '@stoplight/ui-kit';
import { action } from '@storybook/addon-actions';
import { boolean, number, object, select, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JsonSchemaViewer, RowRenderer, SchemaRow } from '../';
import { Wrapper } from './utils/Wrapper';

const allOfSchemaResolved = require('../__fixtures__/allOf/allOf-resolved.json');
const schema = require('../__fixtures__/default-schema.json');
const stressSchema = require('../__fixtures__/stress-schema.json');

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('default', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={schema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 0)}
      expanded={boolean('expanded', true)}
      hideTopBar={boolean('hideTopBar', false)}
      shouldResolveEagerly={boolean('shouldResolveEagerly', false)}
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
      name={text('name', 'my schema')}
      schema={object('schema', {})}
      expanded={boolean('expanded', true)}
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
      maxRows={number('maxRows', 5)}
      mergeAllOf={boolean('mergeAllOf', true)}
      shouldResolveEagerly={boolean('shouldResolveEagerly', false)}
    />
  ))
  .add('custom row renderer', () => {
    const customRowRenderer: RowRenderer = (node, rowOptions) => {
      return (
        <>
          <SchemaRow node={node} rowOptions={rowOptions} />
          <div className="flex h-full items-center">
            <Button className="pl-1 mr-1" small minimal icon={<Icon color="grey" iconSize={12} icon="issue" />} />
            <Checkbox className="mb-0" />
          </div>
        </>
      );
    };

    return (
      <JsonSchemaViewer
        name={text('name', 'my schema')}
        schema={object('schema', schema as JSONSchema4)}
        expanded={boolean('expanded', true)}
        hideTopBar={boolean('hideTopBar', false)}
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
          name={text('name', 'my stress schema')}
          schema={stressSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          expanded={boolean('expanded', false)}
          hideTopBar={boolean('hideTopBar', false)}
          onGoToRef={action('onGoToRef')}
          maxRows={number('maxRows', 10)}
          mergeAllOf={boolean('mergeAllOf', true)}
        />
      </div>
      <div style={{ height: 345 }}>
        <JsonSchemaViewer
          name={text('name', 'my stress schema 2')}
          schema={stressSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          expanded={boolean('expanded', false)}
          hideTopBar={boolean('hideTopBar', false)}
          onGoToRef={action('onGoToRef')}
          maxRows={number('maxRows', 10)}
          mergeAllOf={boolean('mergeAllOf', true)}
        />
      </div>
    </>
  ))
  .add('allOf-schema', () => (
    <JsonSchemaViewer
      schema={allOfSchemaResolved as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
      mergeAllOf={boolean('mergeAllOf', true)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('error boundary', () => (
    <JsonSchemaViewer
      name={text('name', 'throw me an error!')}
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
      hideTopBar={boolean('hideTopBar', false)}
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
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
      mergeAllOf={boolean('mergeAllOf', true)}
    />
  ))
  .add('dark', () => (
    <div style={{ height: '100vh' }} className="bp3-dark bg-gray-8">
      <JsonSchemaViewer
        name={text('name', 'my stress schema')}
        schema={schema as JSONSchema4}
        defaultExpandedDepth={number('defaultExpandedDepth', 2)}
        expanded={boolean('expanded', false)}
        hideTopBar={boolean('hideTopBar', false)}
        onGoToRef={action('onGoToRef')}
        mergeAllOf={boolean('mergeAllOf', true)}
      />
    </div>
  ));

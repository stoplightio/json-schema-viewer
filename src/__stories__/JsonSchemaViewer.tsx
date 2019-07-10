import * as React from 'react';

import { State, Store } from '@sambego/storybook-state';
import { action } from '@storybook/addon-actions';
import { boolean, number, object, select, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JsonSchemaViewer } from '../components';

import { JSONSchema4 } from 'json-schema';
import * as allOfSchemaResolved from '../__fixtures__/allOf/allOf-resolved.json';
import * as allOfSchema from '../__fixtures__/allOf/allOf-schema.json';
import * as schema from '../__fixtures__/default-schema.json';
import * as schemaWithRefs from '../__fixtures__/ref/original.json';
import * as dereferencedSchema from '../__fixtures__/ref/resolved.json';
import * as stressSchema from '../__fixtures__/stress-schema.json';
import { Wrapper } from './utils/Wrapper';
import { Checkbox } from '@blueprintjs/core';

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('default', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={schema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
    />
  ))
  .add('with dereferenced schema', () => {
    const store = new Store<{ selected: string[] }>({
      selected: [],
    });

    return (
      <State store={store}>
        <JsonSchemaViewer
          name={text('name', 'name')}
          schema={schemaWithRefs as JSONSchema4}
          dereferencedSchema={dereferencedSchema as JSONSchema4}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          expanded={boolean('expanded', true)}
          hideTopBar={boolean('hideTopBar', false)}
          onGoToRef={action('onGoToRef')}
        />
      </State>
    );
  })
  .add('custom schema', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={object('schema', {})}
      expanded={boolean('expanded', true)}
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
      maxRows={number('maxRows', 5)}
    />
  ))
  .add('stress-test schema', () => (
    <JsonSchemaViewer
      name={text('name', 'my stress schema')}
      schema={stressSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
      maxRows={number('maxRows', 10)}
    />
  ))
  .add('allOf-schema', () => (
    <JsonSchemaViewer
      schema={allOfSchema as JSONSchema4}
      dereferencedSchema={allOfSchemaResolved as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
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
      onError={(error: any) => console.log('You can hook into the onError handler too!', error)}
      expanded={boolean('expanded', false)}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
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
      />
    </div>
  ))
  .add('with rowRendererRight', () => (
    <JsonSchemaViewer
      rowRendererRight={() => <span>RIGHT!</span>}
      name={text('name', 'my schema')}
      schema={schema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
      onGoToRef={action('onGoToRef')}
    />
  ));

import * as React from 'react';

import { State, Store } from '@sambego/storybook-state';
import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JsonSchemaViewer } from '../components/JsonSchemaViewer';

import { JSONSchema4 } from 'json-schema';
import * as allOfSchemaResolved from '../__fixtures__/allOf/allOf-resolved.json';
import * as allOfSchema from '../__fixtures__/allOf/allOf-schema.json';
import * as schema from '../__fixtures__/default-schema.json';
import * as schemaWithRefs from '../__fixtures__/ref/original.json';
import * as dereferencedSchema from '../__fixtures__/ref/resolved.json';
import * as stressSchema from '../__fixtures__/stress-schema.json';

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={schema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
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
    />
  ))
  .add('stress-test schema', () => (
    <JsonSchemaViewer
      name={text('name', 'my stress schema')}
      schema={stressSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
    />
  ))
  .add('allOf-schema', () => (
    <JsonSchemaViewer
      schema={allOfSchema}
      dereferencedSchema={allOfSchemaResolved}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
    />
  ))
  .add('error boundary', () => (
    <JsonSchemaViewer
      name={text('name', 'throw me an error!')}
      // @ts-ignore
      schema={null}
      onError={(error: any) => console.log('You can hook into the onError handler too!', error)}
      expanded={boolean('expanded', false)}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      hideTopBar={boolean('hideTopBar', false)}
    />
  ));

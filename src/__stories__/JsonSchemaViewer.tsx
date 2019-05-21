import * as React from 'react';

import { State, Store } from '@sambego/storybook-state';
import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JsonSchemaViewer } from '../components';

import { JSONSchema4 } from 'json-schema';
import * as allOfSchemaResolved from '../__fixtures__/allOf/allOf-resolved.json';
import * as allOfSchema from '../__fixtures__/allOf/allOf-schema.json';
import * as schema from '../__fixtures__/default-schema.json';
import * as schemaWithRefs from '../__fixtures__/ref/original.json';
import * as dereferencedSchema from '../__fixtures__/ref/resolved.json';
import * as stressSchema from '../__fixtures__/stress-schema.json';
import { GetRefDetailsFn } from '../types';
import { Wrapper } from './utils/Wrapper';

const getRefDetails: GetRefDetailsFn = node => ({
  fullName: 'full path to ref?',
  url: `https://www.stoplight.io?ref=${node.metadata!.$ref}`,
});

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
      getRefDetails={getRefDetails}
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
          getRefDetails={getRefDetails}
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
      getRefDetails={getRefDetails}
    />
  ))
  .add('stress-test schema', () => (
    <JsonSchemaViewer
      name={text('name', 'my stress schema')}
      schema={stressSchema as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
      getRefDetails={getRefDetails}
    />
  ))
  .add('allOf-schema', () => (
    <JsonSchemaViewer
      schema={allOfSchema as JSONSchema4}
      dereferencedSchema={allOfSchemaResolved as JSONSchema4}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
      getRefDetails={getRefDetails}
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
      getRefDetails={getRefDetails}
    />
  ))
  .add('dark', () => (
    <div style={{ height: '100vh' }} className="bp3-dark bg-gray-8">
      <JsonSchemaViewer
        name={text('name', 'my stress schema')}
        schema={stressSchema as JSONSchema4}
        defaultExpandedDepth={number('defaultExpandedDepth', 2)}
        expanded={boolean('expanded', false)}
        hideTopBar={boolean('hideTopBar', false)}
        getRefDetails={getRefDetails}
      />
    </div>
  ));

import * as React from 'react';

import { State, Store } from '@sambego/storybook-state';
import { action } from '@storybook/addon-actions';
import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JsonSchemaViewer } from '../components/JsonSchemaViewer';

import * as schema from '../__fixtures__/default-schema.json';
import * as schemaWithRefs from '../__fixtures__/ref/original.json';
import * as dereferencedSchema from '../__fixtures__/ref/resolved.json';
import * as stressSchema from '../__fixtures__/stress-schema.json';

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={schema}
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
          schema={schemaWithRefs}
          dereferencedSchema={dereferencedSchema}
          defaultExpandedDepth={number('defaultExpandedDepth', 2)}
          onSelect={(path: string) => {
            const selected = [...store.get('selected')];
            const index = selected.indexOf(path);
            if (index !== -1) {
              selected.splice(index, 1);
            } else {
              selected.push(path);
            }

            store.set({ selected });
            action('onSelect')(path);
          }}
          selected={store.get('selected')}
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
      schema={stressSchema}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', false)}
      hideTopBar={boolean('hideTopBar', false)}
    />
  ));

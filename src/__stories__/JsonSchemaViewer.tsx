import * as React from 'react';

import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { JsonSchemaViewer } from '../JsonSchemaViewer';
import * as schema from './__fixtures__/default-schema.json';

import * as schemaWithRefs from './__fixtures__/ref/original.json';
import * as dereferencedSchema from './__fixtures__/ref/resolved.json';

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={schema}
      limitPropertyCount={number('limitPropertyCount', 20)}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', true)}
    />
  ))
  .add('with dereferenced schema', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={schemaWithRefs}
      dereferencedSchema={dereferencedSchema}
      limitPropertyCount={number('limitPropertyCount', 20)}
      defaultExpandedDepth={number('defaultExpandedDepth', 2)}
      expanded={boolean('expanded', true)}
    />
  ))
  .add('custom schema', () => (
    <JsonSchemaViewer
      name={text('name', 'my schema')}
      schema={object('schema', {})}
      limitPropertyCount={number('limitPropertyCount', 20)}
      expanded={boolean('expanded', true)}
    />
  ));

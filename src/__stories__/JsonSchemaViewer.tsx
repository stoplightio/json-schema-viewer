import * as React from 'react';

import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { JsonSchemaViewer } from '../JsonSchemaViewer';
import * as schema from './__fixtures__/default-schema.json';
import * as nestedSchema from './__fixtures__/nested-schema.json';

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <JsonSchemaViewer
      css={{ fontFamily: 'monospace' }}
      name={text('name', 'name')}
      schemas={object('schemas', {})}
      schema={schema}
      limitPropertyCount={number('limitPropertyCount', 20)}
      hideRoot={boolean('hideRoot', false)}
      expanded={boolean('expanded', true)}
    />
  ))
  .add('custom schema', () => (
    <JsonSchemaViewer
      css={{ fontFamily: 'monospace' }}
      name={text('name', 'name')}
      schemas={object('schemas', {})}
      schema={object('schema', nestedSchema)}
      limitPropertyCount={number('limitPropertyCount', 20)}
      hideRoot={boolean('hideRoot', false)}
      expanded={boolean('expanded', true)}
    />
  ));

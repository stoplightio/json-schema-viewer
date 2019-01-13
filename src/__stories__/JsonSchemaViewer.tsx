import * as React from 'react';

import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { JsonSchemaViewer } from '../JsonSchemaViewer';

const schema = {
  properties: {
    data: {
      items: {
        $ref: '#/definitions/Gif',
      },
      type: 'array',
    },
    meta: {
      $ref: '#/definitions/Meta',
    },
    pagination: {
      $ref: '#/definitions/Pagination',
    },
  },
};

storiesOf('JsonSchemaViewer', module)
  .addDecorator(withKnobs)
  .add('with text', () => (
    <JsonSchemaViewer
      css={{ fontFamily: 'monospace' }}
      name={text('name', 'name')}
      schemas={object('schemas', {})}
      schema={object('schema', schema)}
      limitPropertyCount={number('limitPropertyCount', 20)}
      hideRoot={boolean('hideRoot', false)}
      expanded={boolean('expanded', true)}
    />
  ));

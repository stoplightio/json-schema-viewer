import * as React from 'react';

import { boolean, number, object, text } from '@storybook/addon-knobs';
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

storiesOf('JsonSchemaViewer', module).add('with text', () => (
  <JsonSchemaViewer
    name={text('name', 'name')}
    schemas={{}}
    schema={object('schema', schema)}
    limitPropertyCount={number('limitPropertyCount', 20)}
    hideRoot={boolean('hideRoot', false)}
    expanded={boolean('expanded', true)}
    emptyText={text('emptyText', 'empty')}
    emptyClass={text('emptyClass', 'empty')}
  />
));

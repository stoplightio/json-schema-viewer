import * as React from 'react';

import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { JsonSchemaViewer } from '../JsonSchemaViewer';

storiesOf('JsonSchemaViewer', module).add('with text', () => (
  <JsonSchemaViewer
    name={text('name', 'name')}
    schemas={{}}
    schema={{}}
    limitPropertyCount={number('limitPropertyCount', 20)}
    hideRoot={boolean('hideRoot', false)}
    expanded={boolean('expanded', true)}
    emptyText={text('emptyText', 'empty')}
    emptyClass={text('emptyClass', 'empty')}
  />
));

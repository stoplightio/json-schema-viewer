import * as React from 'react';

import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { JsonSchemaViewer } from '../JsonSchemaViewer';

/*

  static propTypes = {
    name: PropTypes.string,
    schemas: PropTypes.object,
    schema: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    limitPropertyCount: PropTypes.number,
    hideRoot: PropTypes.bool,
    expanded: PropTypes.bool,

    emptyText: PropTypes.string,
    emptyClass: PropTypes.string,
  };
*/

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

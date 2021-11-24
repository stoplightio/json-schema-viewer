import { Provider as MosaicProvider } from '@stoplight/mosaic';
import { withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaRow } from '../components';
import { buildTree, findNodeWithPath } from '../components/shared/__tests__/utils';
import { Wrapper } from './utils/Wrapper';

const schema: JSONSchema4 = require('../__fixtures__/schemaRowBugs/schemaRowBugs.json');

let tree = buildTree(schema);

storiesOf('Bugs|SchemaRow Component.oneOf', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('[WAE] - Single Object - Description Works', () => {
    return (
      <MosaicProvider>
        <SchemaRow
          // schemaNode={findNodeWithPath(tree, ['properties', 'oneOf-single-object-working-description'])!}
          schemaNode={findNodeWithPath(tree, ['properties', 'oneOf-single-object-working-description'])!}
          nestingLevel={0}
        />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Two Objects - Description is hidden', () => {
    return (
      <MosaicProvider>
        <SchemaRow
          schemaNode={findNodeWithPath(tree, ['properties', 'oneOf-two-objects-hidden-description'])!}
          nestingLevel={0}
        />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Single Object - Description hidden when empty', () => {
    return (
      <MosaicProvider>
        <SchemaRow
          schemaNode={findNodeWithPath(tree, ['properties', 'oneOf-one-object-hidden-description-when-empty'])!}
          nestingLevel={0}
        />
      </MosaicProvider>
    );
  });

storiesOf('Bugs|SchemaRow Component.anyOf', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('[W.A.E] - Single Object - Description Works', () => {
    return (
      <MosaicProvider>
        <SchemaRow
          schemaNode={findNodeWithPath(tree, ['properties', 'anyOf-single-object-working-description'])!}
          nestingLevel={0}
        />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Two Objects - Description is hidden', () => {
    return (
      <MosaicProvider>
        <SchemaRow
          schemaNode={findNodeWithPath(tree, ['properties', 'anyOf-two-objects-hidden-description'])!}
          nestingLevel={0}
        />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Single Object - Description hidden when empty', () => {
    return (
      <MosaicProvider>
        <SchemaRow
          schemaNode={findNodeWithPath(tree, ['properties', 'anyOf-one-object-hidden-description-when-empty'])!}
          nestingLevel={0}
        />
      </MosaicProvider>
    );
  });

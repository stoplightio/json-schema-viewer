import { Provider as MosaicProvider } from '@stoplight/mosaic';
import { object, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaRow } from '../components';
import { buildTree, findNodeWithPath } from '../components/shared/__tests__/utils';
import { Wrapper } from './utils/Wrapper';

const schema: JSONSchema4 = require('../__fixtures__/schemaRowBugs/schemaRowBugs.json');

const tree = buildTree(schema);

const slugList = [
  'oneOf-single-object-working-description',
  'oneOf-two-objects-hidden-description',
  'oneOf-one-object-hidden-description-when-empty',
  'anyOf-single-object-working-description',
  'anyOf-two-objects-hidden-description',
  'anyOf-one-object-hidden-description-when-empty',
];

storiesOf('Bugs|SchemaRow Component.oneOf', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('[WAE] - Single Object - Description Works', () => {
    const node = findNodeWithPath(tree, ['properties', slugList[0]])!;
    object('Schema Node', node.fragment);
    return (
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Two Objects - Description is hidden', () => {
    const node = findNodeWithPath(tree, ['properties', slugList[1]])!;
    object('Schema Node', node.fragment);
    return (
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Single Object - Description hidden when empty', () => {
    const node = findNodeWithPath(tree, ['properties', slugList[2]])!;
    object('Schema Node', node.fragment);
    return (
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>
    );
  });

storiesOf('Bugs|SchemaRow Component.anyOf', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Wrapper>{storyFn()}</Wrapper>)
  .add('[WAE] - Single Object - Description Works', () => {
    const node = findNodeWithPath(tree, ['properties', slugList[3]])!;
    object('Schema Node', node.fragment);
    return (
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Two Objects - Description is hidden', () => {
    const node = findNodeWithPath(tree, ['properties', slugList[4]])!;
    object('Schema Node', node.fragment);
    return (
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>
    );
  })
  .add('[BUG] - Single Object - Description hidden when empty', () => {
    const node = findNodeWithPath(tree, ['properties', slugList[5]])!;
    object('Schema Node', node.fragment);
    return (
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>
    );
  });

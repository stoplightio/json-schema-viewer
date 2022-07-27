import 'jest-enzyme';

import { mount } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaRow } from '../../SchemaRow';
import { Types } from '../Types';
import { buildTree, findNodeWithPath } from './utils';

describe('Format component', () => {
  const schema: JSONSchema4 = require('../../../__fixtures__/formats-schema.json');
  let tree = buildTree(schema);

  it('should render next to a single type', () => {
    const wrapper = mount(<SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'id'])!} nestingLevel={0} />);
    expect(wrapper.find(Types)).toHaveText('number<float>');
    wrapper.unmount();
  });

  it.each`
    property           | text
    ${'count'}         | ${'integer<int32> or null'}
    ${'date-of-birth'} | ${'number or string<date-time> or array'}
    ${'size'}          | ${'number<byte> or string'}
  `('given $property property, should render next to the appropriate type', ({ property, text }) => {
    const wrapper = mount(
      <SchemaRow schemaNode={findNodeWithPath(tree, ['properties', property])!} nestingLevel={0} />,
    );
    expect(wrapper.find(Types)).toHaveText(text);
    wrapper.unmount();
  });

  it('should render even when the type(s) is/are missing', () => {
    const wrapper = mount(
      <SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'notype'])!} nestingLevel={0} />,
    );
    expect(wrapper.find(Types)).toHaveText('<date-time>');
    wrapper.unmount();
  });
});

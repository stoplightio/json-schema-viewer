import 'jest-enzyme';

import { mount } from 'enzyme';
import * as React from 'react';

import { JSONSchema } from '../../../types';
import { SchemaRow } from '../../SchemaRow';
import { Format } from '../Format';
import { buildTree, findNodeWithPath } from './utils';

describe('Format component', () => {
  const schema: JSONSchema = require('../../../__fixtures__/formats-schema.json');
  let tree = buildTree(schema);

  it('should render next to a single type', () => {
    const wrapper = mount(<SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'id'])!} nestingLevel={0} />);
    expect(wrapper.find(Format)).toHaveText('<float>');
    wrapper.unmount();
  });

  it('should render next to an array of types', () => {
    const wrapper = mount(
      <SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'date-of-birth'])!} nestingLevel={0} />,
    );
    expect(wrapper.find(Format)).toHaveText('<date-time>');
    wrapper.unmount();
  });

  it('should render even when the type(s) is/are missing', () => {
    const wrapper = mount(
      <SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'notype'])!} nestingLevel={0} />,
    );
    expect(wrapper.find(Format)).toHaveText('<date-time>');
    wrapper.unmount();
  });
});

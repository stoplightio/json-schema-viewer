import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import { SchemaNodeWithMeta } from '../../types';
import { Property, Types } from '../shared';

describe('Property component', () => {
  it('should render Types with proper type and subtype', () => {
    const node: SchemaNodeWithMeta = {
      id: '1',
      type: 'array',
      items: {
        type: 'string',
      },
      annotations: {
        examples: {},
      },
      validations: {},
      path: [],
    };

    const wrapper = shallow(<Property node={node} />);
    expect(wrapper.find(Types)).toExist();
    expect(wrapper.find(Types)).toHaveProp('type', 'array');
    expect(wrapper.find(Types)).toHaveProp('subtype', 'string');
  });

  it('should handle nullish items', () => {
    const node = {
      id: '1',
      type: 'array',
      items: null,
      annotations: {
        examples: {},
      },
      validations: {},
      path: [],
    };

    const wrapper = shallow(<Property node={node as SchemaNodeWithMeta} />);
    expect(wrapper).not.toBeEmptyRender();
  });
});

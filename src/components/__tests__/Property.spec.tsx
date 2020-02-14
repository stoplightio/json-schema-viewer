import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import { SchemaNode } from '../../types';
import { Property, Types } from '../shared';

describe('Property component', () => {
  it('should render Types with proper type and subtype', () => {
    const node: SchemaNode = {
      id: '2',
      type: 'array',
      items: {
        type: 'string',
      },
      annotations: {
        examples: {},
      },
      validations: {},
    };

    const wrapper = shallow(<Property node={node} path={[]} />);
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
    } as SchemaNode;

    const wrapper = shallow(<Property node={node} path={[]} />);
    expect(wrapper).not.toBeEmptyRender();
  });
});

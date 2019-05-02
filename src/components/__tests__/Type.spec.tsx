import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import { IType, PropertyTypeColors, Type } from '../Type';

describe('Type component', () => {
  it.each(Object.keys(PropertyTypeColors))('should handle $s type', type => {
    const wrapper = shallow(<Type type={type as IType['type']} />);

    expect(wrapper).toHaveText(type);
  });

  it('should handle unknown types', () => {
    // @ts-ignore
    const wrapper = shallow(<Type type="foo" />);

    expect(wrapper).toHaveText('foo');
  });

  it('should display non-array subtype for array', () => {
    const wrapper = shallow(<Type type="array" subtype="object" />);

    expect(wrapper).toHaveText('array[object]');
  });

  it('should not display array subtype for array', () => {
    const wrapper = shallow(<Type type="array" subtype="array" />);

    expect(wrapper).toHaveText('array');
  });
});

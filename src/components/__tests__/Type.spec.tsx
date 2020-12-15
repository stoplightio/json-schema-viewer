import 'jest-enzyme';

import { shallow } from 'enzyme';
import * as React from 'react';

import { SchemaKind } from '../../types';
import { IType, PropertyTypeColors, Type } from '../shared/Types';

describe('Type component', () => {
  it.each(Object.keys(PropertyTypeColors))('should handle $s type', type => {
    const wrapper = shallow(<Type type={type as IType['type']} subtype={void 0} title={void 0} />);

    expect(wrapper).toHaveText(type);
  });

  it('should handle unknown types', () => {
    // @ts-ignore
    const wrapper = shallow(<Type type="foo" subtype={void 0} title={void 0} />);

    expect(wrapper).toHaveText('foo');
  });

  it('should display non-array subtype for array', () => {
    const wrapper = shallow(<Type type={SchemaKind.Array} subtype={SchemaKind.Object} title={void 0} />);

    expect(wrapper).toHaveText('array[object]');
  });

  it('should not display array subtype for array', () => {
    const wrapper = shallow(<Type type={SchemaKind.Array} subtype={SchemaKind.Array} title={void 0} />);

    expect(wrapper).toHaveText('array');
  });

  describe('titles', () => {
    describe('when main type equals array', () => {
      it('given object type, should display title', () => {
        const wrapper = shallow(<Type type={SchemaKind.Array} subtype={SchemaKind.Object} title="foo" />);

        expect(wrapper).toHaveText('foo[]');
      });

      it('given array type, should display title', () => {
        const wrapper = shallow(<Type type={SchemaKind.Array} subtype={SchemaKind.Array} title="foo" />);

        expect(wrapper).toHaveText('foo[]');
      });

      it('given primitive type, should not display title', () => {
        const wrapper = shallow(<Type type={SchemaKind.Array} subtype={SchemaKind.String} title="foo" />);

        expect(wrapper).toHaveText('array[string]');
      });

      it('given mixed types, should not display title', () => {
        const wrapper = shallow(
          <Type type={SchemaKind.Array} subtype={[SchemaKind.String, SchemaKind.Object]} title="foo" />,
        );

        expect(wrapper).toHaveText('array[string,object]');
      });

      it('given $ref type, should display title', () => {
        const wrapper = shallow(<Type type={SchemaKind.Array} subtype="$ref" title="foo" />);

        expect(wrapper).toHaveText('foo[]');
      });
    });

    it('given object type, should always display title', () => {
      const wrapper = shallow(<Type type={SchemaKind.Object} subtype={void 0} title="foo" />);

      expect(wrapper).toHaveText('foo');
    });

    it('given $ref type, should always display title', () => {
      const wrapper = shallow(<Type type="$ref" subtype={void 0} title="foo" />);

      expect(wrapper).toHaveText('foo');
    });

    it.each([SchemaKind.Null, SchemaKind.Integer, SchemaKind.Number, SchemaKind.Boolean, SchemaKind.String])(
      'given primitive %s type, should not display title',
      type => {
        const wrapper = shallow(<Type type={type} subtype={void 0} title="foo" />);

        expect(wrapper).toHaveText(type);
      },
    );
  });
});

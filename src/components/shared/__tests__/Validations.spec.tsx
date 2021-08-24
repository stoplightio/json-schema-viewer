import 'jest-enzyme';

import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { mount } from 'enzyme';
import * as React from 'react';

import { Validations } from '../../shared';
import { getValidationsFromSchema } from '../Validations';
import { buildTree } from './utils';

describe('Validations component', () => {
  it('should render number type validations', () => {
    const node = new RegularNode({
      type: 'number',
      minimum: 10,
      maximum: 40,
      multipleOf: 10,
      default: 20,
      example: 20,
      enum: [10, 20, 30, 40],
    });

    const validations = getValidationsFromSchema(node);
    const wrapper = mount(<Validations validations={validations} />);

    expect(wrapper).toIncludeText('>= 10<= 40');
    expect(wrapper).toIncludeText('Allowed values:10203040');
    expect(wrapper).toIncludeText('Default value:20');
    expect(wrapper).toIncludeText('Multiple of:10');
    expect(wrapper).toIncludeText('Example value:20');
  });

  it('should render string type validations', () => {
    const node = new RegularNode({
      type: 'string',
      minLength: 2,
      maxLength: 4,
      default: 'foo',
      examples: ['Example 1', 'Example 2'],
      const: 'bar',
    });

    const validations = getValidationsFromSchema(node);
    const wrapper = mount(<Validations validations={validations} />);

    expect(wrapper).toIncludeText('>= 2 characters<= 4 characters');
    expect(wrapper).toIncludeText('Default value:foo');
    expect(wrapper).toIncludeText('Example values:Example 1Example 2');
    expect(wrapper).toIncludeText('Allowed value:bar');
  });

  it('should check for array child enum', () => {
    const tree = buildTree({
      type: 'array',
      items: {
        enum: ['p1', 'p2', 'p3'],
      },
    });

    const node = tree.children[0] as RegularNode;

    expect(isRegularNode(node)).toBe(true);
    const validations = getValidationsFromSchema(node);
    const wrapper = mount(<Validations validations={validations} />);

    expect(wrapper).toIncludeText('Allowed values:p1p2p3');
  });

  it('should not render hidden example validations', () => {
    const node = new RegularNode({
      type: 'number',
      example: 42,
      examples: [4, 2],
    });

    const validations = getValidationsFromSchema(node);
    const wrapper = mount(<Validations validations={validations} hideExamples />);

    expect(wrapper).not.toIncludeText('Example value:42');
    expect(wrapper).not.toIncludeText('Example values:42');
  });

  describe('OAS formats', () => {
    it('given default range, should not render any validation', () => {
      const node = new RegularNode({
        type: 'integer',
        format: 'int32',
        minimum: 0 - Math.pow(2, 31),
        maximum: Math.pow(2, 31) - 1,
      });

      const validations = getValidationsFromSchema(node);
      const wrapper = mount(<Validations validations={validations} />);

      expect(wrapper).toBeEmptyRender();
    });

    it('should render non-standard values', () => {
      const node = new RegularNode({
        type: 'integer',
        format: 'int64',
        minimum: 0,
        maximum: Math.pow(2, 63) - 1,
      });

      const validations = getValidationsFromSchema(node);
      const wrapper = mount(<Validations validations={validations} />);

      expect(wrapper).toIncludeText('>= 0');
    });
  });
});

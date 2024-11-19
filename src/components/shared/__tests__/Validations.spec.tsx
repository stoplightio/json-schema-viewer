import '@testing-library/jest-dom';

import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

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
    const wrapper = render(<Validations validations={validations} />).container;

    expect(wrapper).toHaveTextContent('>= 10<= 40');
    expect(wrapper).toHaveTextContent('Allowed values:10203040');
    expect(wrapper).toHaveTextContent('Default:20');
    expect(wrapper).toHaveTextContent('Multiple of:10');
    expect(wrapper).toHaveTextContent('Example:20');
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
    const wrapper = render(<Validations validations={validations} />).container;

    expect(wrapper).toHaveTextContent('>= 2 characters<= 4 characters');
    expect(wrapper).toHaveTextContent('Default:foo');
    expect(wrapper).toHaveTextContent('Examples:Example 1Example 2');
    expect(wrapper).toHaveTextContent('Allowed value:bar');
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
    const wrapper = render(<Validations validations={validations} />).container;

    expect(wrapper).toHaveTextContent('Allowed values:p1p2p3');
  });

  it('should check for array child fragment.pattern', () => {
    const tree = buildTree({
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[a-z0-9]{13}$',
      },
    });

    const node = tree.children[0] as RegularNode;

    expect(isRegularNode(node)).toBe(true);
    const validations = getValidationsFromSchema(node);
    const wrapper = render(<Validations validations={validations} />).container;

    expect(wrapper).toHaveTextContent('Match pattern:^[a-z0-9]{13}$');
  });

  it('should not render hidden example validations', () => {
    const node = new RegularNode({
      type: 'number',
      example: 42,
      examples: [4, 2],
    });

    const validations = getValidationsFromSchema(node);
    const wrapper = render(<Validations validations={validations} hideExamples />).container;

    expect(wrapper).not.toHaveTextContent('Example value:42');
    expect(wrapper).not.toHaveTextContent('Example values:42');
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
      const wrapper = render(<Validations validations={validations} />);

      expect(wrapper.container.firstChild).toMatchInlineSnapshot(`null`);
    });

    it('should render non-standard values', () => {
      const node = new RegularNode({
        type: 'integer',
        format: 'int64',
        minimum: 0,
        maximum: Math.pow(2, 63) - 1,
      });

      const validations = getValidationsFromSchema(node);
      const wrapper = render(<Validations validations={validations} />).container;

      expect(wrapper).toHaveTextContent('>= 0');
    });

    it('should not render any range if not defined', () => {
      const node = new RegularNode({
        type: 'integer',
        format: 'int64',
      });

      const validations = getValidationsFromSchema(node);
      const wrapper = render(<Validations validations={validations} />).container;

      expect(wrapper).toHaveTextContent('');
    });
  });
});

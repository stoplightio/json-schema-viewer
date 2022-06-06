import 'jest-enzyme';

import { RootNode } from '@stoplight/json-schema-tree';
import { Icon } from '@stoplight/mosaic';
import { mount } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaRow } from '../SchemaRow';
import { buildTree, findNodeWithPath } from '../shared/__tests__/utils';
import { Properties } from '../shared/Properties';

describe('SchemaRow component', () => {
  describe('resolving error', () => {
    let tree: RootNode;
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          user: {
            $ref: '#/properties/foo',
          },
        },
      };

      tree = buildTree(schema);
    });

    it('given no custom resolver, should render a generic error message', () => {
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(1)).toHaveProp('title', `Could not resolve '#/properties/foo'`);
      wrapper.unmount();
    });

    it('given a custom resolver, should render a message thrown by it', () => {
      const message = "I don't know how to resolve it. Sorry";

      tree = buildTree(schema, {
        refResolver: () => {
          throw new ReferenceError(message);
        },
      });

      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(1)).toHaveProp('title', message);
      wrapper.unmount();
    });
  });

  describe('resolving permission error', () => {
    let tree: RootNode;
    let schema: JSONSchema4;

    it('given an object schema is marked as internal, a permission denied error messsage should be shown', () => {
      schema = {
        type: 'object',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
      wrapper.unmount();
    });

    it('given a number schema is marked as internal, a permission denied error messsage should be shown', () => {
      schema = {
        type: 'number',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
      wrapper.unmount();
    });

    it('given an integer schema is marked as internal, a permission denied error messsage should be shown', () => {
      schema = {
        type: 'integer',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
      wrapper.unmount();
    });

    it('given a string schema is marked as internal, a permission denied error messsage should be shown', () => {
      schema = {
        type: 'string',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
      wrapper.unmount();
    });

    it('given a boolean schema is marked as internal, a permission denied error messsage should be shown', () => {
      schema = {
        type: 'boolean',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
      wrapper.unmount();
    });

    it('given an array schema is marked as internal, a permission denied error messsage should be shown', () => {
      schema = {
        title: 'test',
        type: 'array',
        items: {
          type: 'array',
          'x-sl-internally-excluded': true,
          'x-sl-error-message': 'You do not have permission to view this reference',
        },
      };
      tree = buildTree(schema);
      const wrapper = mount(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
      wrapper.unmount();
    });
  });

  describe('required property', () => {
    let schema: JSONSchema4;

    function isRequired(schema: JSONSchema4, nodePath: readonly string[], value: boolean) {
      const tree = buildTree(schema);

      const schemaNode = findNodeWithPath(tree, nodePath);
      if (!schemaNode) {
        throw Error('Node not found, invalid configuration');
      }
      const wrapper = mount(<SchemaRow schemaNode={schemaNode} nestingLevel={0} />);
      expect(wrapper.find(Properties)).toHaveProp('required', value);
      wrapper.unmount();
    }

    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          user: {
            $ref: '#/properties/id',
          },
          id: {
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'number',
              },
            },
          },
        },
      };
    });

    it('should preserve the required validation', () => {
      isRequired(schema, ['properties', 'id', 'properties', 'foo'], true);
    });

    it('should preserve the optional validation', () => {
      isRequired(schema, ['properties', 'id', 'properties', 'bar'], false);
    });

    describe('given a referenced object', () => {
      it('should preserve the required validation', () => {
        isRequired(schema, ['properties', 'user', 'properties', 'foo'], true);
      });

      it('should preserve the optional validation', () => {
        isRequired(schema, ['properties', 'user', 'properties', 'bar'], false);
      });
    });

    describe('given array with items', () => {
      beforeEach(() => {
        schema = {
          title: 'test',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: {
                type: 'number',
              },
              msg: {
                type: 'string',
              },
              ref: {
                type: 'string',
              },
            },
            required: ['code', 'msg'],
          },
        };
      });

      it('should preserve the required validation for code item', () => {
        isRequired(schema, ['items', 'properties', 'code'], true);
      });

      it('should preserve the required validation for msg item', () => {
        isRequired(schema, ['items', 'properties', 'msg'], true);
      });

      it('should preserve the optional validation', () => {
        isRequired(schema, ['items', 'properties', 'ref'], false);
      });
    });

    describe('given array with arrayish items', () => {
      beforeEach(() => {
        schema = {
          title: 'test',
          type: 'array',
          items: [
            {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                },
                msg: {
                  type: 'string',
                },
                ref: {
                  type: 'string',
                },
              },
              required: ['code', 'msg'],
            },
          ],
        };
      });

      it('should preserve the required validation for code item', () => {
        isRequired(schema, ['items', '0', 'properties', 'code'], true);
      });

      it('should preserve the required validation for msg item', () => {
        isRequired(schema, ['items', '0', 'properties', 'msg'], true);
      });

      it('should preserve the optional validation', () => {
        isRequired(schema, ['items', '0', 'properties', 'ref'], false);
      });
    });
  });
});

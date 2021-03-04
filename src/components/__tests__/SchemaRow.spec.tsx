import 'jest-enzyme';

import { Icon } from '@stoplight/mosaic';
import { mount } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaTreeListTree } from '../../tree';
import { SchemaRow } from '../SchemaRow';
import { Properties } from '../shared/Properties';

describe('SchemaRow component', () => {
  describe('resolving error', () => {
    let tree: SchemaTreeListTree;
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

      tree = new SchemaTreeListTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
      });

      tree.populate();
    });

    it('given no custom resolver, should render a generic error message', () => {
      const wrapper = mount(<SchemaRow treeListNode={tree.itemAt(1)!} rowOptions={{}} />);
      expect(wrapper.find(Icon)).toHaveProp('title', `Could not resolve '#/properties/foo'`);
      wrapper.unmount();
    });

    it('given a custom resolver, should render a message thrown by it', () => {
      const message = "I don't know how to resolve it. Sorry";

      tree = new SchemaTreeListTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef() {
          throw new ReferenceError(message);
        },
      });

      tree.populate();

      const wrapper = mount(<SchemaRow treeListNode={tree.itemAt(1)!} rowOptions={{}} />);
      expect(wrapper.find(Icon)).toHaveProp('title', message);
      wrapper.unmount();
    });
  });

  describe('required property', () => {
    let schema: JSONSchema4;

    function isRequired(schema: JSONSchema4, pos: number, value: boolean) {
      const tree = new SchemaTreeListTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
      });

      tree.populate();

      const wrapper = mount(<SchemaRow treeListNode={tree.itemAt(pos)!} rowOptions={{}} />);
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
      isRequired(schema, 5, true);
    });

    it('should preserve the optional validation', () => {
      isRequired(schema, 6, false);
    });

    describe('given a referenced object', () => {
      it('should preserve the required validation', () => {
        isRequired(schema, 2, true);
      });

      it('should preserve the optional validation', () => {
        isRequired(schema, 3, false);
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

      it.each([1, 2])('should preserve the required validation for %i item', pos => {
        isRequired(schema, pos, true);
      });

      it('should preserve the optional validation', () => {
        isRequired(schema, 3, false);
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

      it.each([1, 2])('should preserve the required validation for %i item', pos => {
        isRequired(schema, pos, true);
      });

      it('should preserve the optional validation', () => {
        isRequired(schema, 3, false);
      });
    });
  });
});

import '@testing-library/jest-dom';

import { RootNode } from '@stoplight/json-schema-tree';
import { render } from '@testing-library/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SchemaRow } from '../SchemaRow';
import { buildTree, findNodeWithPath } from '../shared/__tests__/utils';

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

    it('given no custom resolver, should render a generic error message', async () => {
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`Could not resolve '#/properties/foo'`)).toBeInTheDocument();
    });

    it('given a custom resolver, should render a message thrown by it', async () => {
      const message = "I don't know how to resolve it. Sorry";

      tree = buildTree(schema, {
        refResolver: () => {
          throw new ReferenceError(message);
        },
      });

      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(message)).toBeInTheDocument();
    });
  });

  describe('resolving permission error', () => {
    let tree: RootNode;
    let schema: JSONSchema4;

    it('given an object schema is marked as internal, a permission denied error message should be shown', async () => {
      schema = {
        type: 'object',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`You do not have permission to view this reference`)).toBeInTheDocument();
    });

    it('given a number schema is marked as internal, a permission denied error messsage should be shown', async () => {
      schema = {
        type: 'number',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`You do not have permission to view this reference`)).toBeInTheDocument();
    });

    it('given an integer schema is marked as internal, a permission denied error messsage should be shown', async () => {
      schema = {
        type: 'integer',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`You do not have permission to view this reference`)).toBeInTheDocument();
    });

    it('given a string schema is marked as internal, a permission denied error messsage should be shown', async () => {
      schema = {
        type: 'string',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`You do not have permission to view this reference`)).toBeInTheDocument();
    });

    it('given a boolean schema is marked as internal, a permission denied error messsage should be shown', async () => {
      schema = {
        type: 'boolean',
        'x-sl-internally-excluded': true,
        'x-sl-error-message': 'You do not have permission to view this reference',
      };
      tree = buildTree(schema);
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`You do not have permission to view this reference`)).toBeInTheDocument();
    });

    it('given an array schema is marked as internal, a permission denied error messsage should be shown', async () => {
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
      const wrapper = render(<SchemaRow schemaNode={tree.children[0]!} nestingLevel={0} />);
      expect(await wrapper.findByLabelText(`You do not have permission to view this reference`)).toBeInTheDocument();
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
      const wrapper = render(<SchemaRow schemaNode={schemaNode} nestingLevel={0} />);
      const requiredEl = wrapper.queryByTestId('property-required');
      if (value) {
        expect(requiredEl).toBeInTheDocument();
      } else {
        expect(requiredEl).not.toBeInTheDocument();
      }
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
  describe('schema node with contentMediaType', () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          profile_photo: {
            type: 'string',
            contentMediaType: 'application/octet-stream',
            description: "This is user's profile photo",
          },
        },
      };
    });

    it('should render correct type name for binary type', async () => {
      const tree = buildTree(schema);

      const schemaNode = findNodeWithPath(tree, ['properties', 'profile_photo']);
      if (!schemaNode) {
        throw Error('Node not found, invalid configuration');
      }
      const wrapper = render(<SchemaRow schemaNode={schemaNode} nestingLevel={0} />);
      const spanWrapper = await wrapper.findByTestId('property-type');
      expect(spanWrapper).toHaveTextContent('string<binary>');
    });
  });
});

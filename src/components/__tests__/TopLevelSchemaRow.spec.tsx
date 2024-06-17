import '@testing-library/jest-dom';

import { RootNode } from '@stoplight/json-schema-tree';
import { render } from '@testing-library/react';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { TopLevelSchemaRow } from '../SchemaRow/TopLevelSchemaRow';
import { buildTree } from '../shared/__tests__/utils';

describe('resolving permission error', () => {
  let tree: RootNode;
  let schema: JSONSchema4;

  it('given an object schema has a mixture of properties with and without x-sl-error-message, a permission denied error message should be shown on properties with x-sl-error-message', () => {
    schema = {
      title: 'User',
      type: 'object',
      description: '',
      properties: {
        id: {
          type: 'integer',
          description: 'Unique identifier for the given user.',
        },
        firstName: {
          type: 'string',
        },
        mailingAddress: {
          type: 'object',
          'x-sl-error-message': 'You do not have permission to view this reference',
          'x-sl-internally-excluded': true,
        },
        billingAddresses: {
          type: 'array',
          'x-sl-error-message': 'You do not have permission to view this reference',
          'x-sl-internally-excluded': true,
        },
      },
    };

    tree = buildTree(schema);
    const wrapper = render(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    const icons = wrapper.queryAllByLabelText('You do not have permission to view this reference');
    expect(icons).toHaveLength(2);

    wrapper.unmount();
  });

  it('given an object schema with all properties containing x-sl-error-message, a permission denied error message should be shown for each', () => {
    schema = {
      title: 'User',
      type: 'object',
      description: '',
      properties: {
        mailingAddress: {
          type: 'object',
          'x-sl-error-message': 'You do not have permission to view this reference',
          'x-sl-internally-excluded': true,
        },
        testAddress: {
          type: 'string',
          'x-sl-error-message': 'You do not have permission to view this reference',
          'x-sl-internally-excluded': true,
        },
        billingAddresses: {
          type: 'array',
          'x-sl-error-message': 'You do not have permission to view this reference',
          'x-sl-internally-excluded': true,
        },
      },
    };

    tree = buildTree(schema);
    const wrapper = render(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    const icons = wrapper.queryAllByLabelText('You do not have permission to view this reference');
    expect(icons).toHaveLength(3);
    wrapper.unmount();
  });

  it('given an object schema where the toplevel contains x-sl-error-message, a permission denied error message should be shown', () => {
    schema = {
      type: 'object',
      'x-sl-error-message': 'You do not have permission to view this reference',
      'x-sl-internally-excluded': true,
    };
    tree = buildTree(schema);
    const wrapper = render(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    const icons = wrapper.queryAllByLabelText('You do not have permission to view this reference');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toBeInTheDocument();
    wrapper.unmount();
  });

  it('given an object schema has properties without ax-sl-error-message, a permission denied error message should not be shown', () => {
    schema = {
      title: 'User',
      type: 'object',
      description: '',
      properties: {
        id: {
          type: 'integer',
          description: 'Unique identifier for the given user.',
        },
        firstName: {
          type: 'string',
        },
        otherName: {
          type: 'array',
          items: {
            title: 'Address',
            type: 'object',
            description: '',
            properties: {
              id: {
                type: 'integer',
                description: 'Unique identifier for the given user.',
              },
              location: {
                type: 'string',
              },
            },
          },
        },
      },
    };

    tree = buildTree(schema);
    const wrapper = render(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    const icons = wrapper.queryAllByLabelText('You do not have permission to view this reference');
    expect(icons).toHaveLength(0);
    wrapper.unmount();
  });
});

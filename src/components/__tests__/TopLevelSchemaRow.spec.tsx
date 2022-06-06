import 'jest-enzyme';

import { RootNode } from '@stoplight/json-schema-tree';
import { Icon } from '@stoplight/mosaic';
import { mount } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { TopLevelSchemaRow } from '../SchemaRow/TopLevelSchemaRow';
import { buildTree } from '../shared/__tests__/utils';

describe('resolving permission error', () => {
  let tree: RootNode;
  let schema: JSONSchema4;

  it('given an object schema has a mixture of properties with and without x-sl-error-message, a permission denied error messsage should be shown on properties with x-sl-error-message', () => {
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
    const wrapper = mount(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(1)).toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(2)).not.toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(3)).not.toHaveProp('title', `You do not have permission to view this reference`);
    wrapper.unmount();
  });

  it('given an object schema with all properties containing x-sl-error-message, a permission denied error messsage should be shown for each', () => {
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
    const wrapper = mount(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(1)).toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(2)).toHaveProp('title', `You do not have permission to view this reference`);
    wrapper.unmount();
  });

  it('given an object schema where the toplevel contains x-sl-error-message, a permission denied error messsage should be shown', () => {
    schema = {
      type: 'object',
      'x-sl-error-message': 'You do not have permission to view this reference',
      'x-sl-internally-excluded': true,
    };
    tree = buildTree(schema);
    const wrapper = mount(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    expect(wrapper.find(Icon).at(0)).toHaveProp('title', `You do not have permission to view this reference`);
    wrapper.unmount();
  });

  it('given an object schema has properties without ax-sl-error-message, a permission denied error messsage should not be shown', () => {
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
    const wrapper = mount(<TopLevelSchemaRow schemaNode={tree.children[0]!} />);
    expect(wrapper.find(Icon).at(1)).not.toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(2)).not.toHaveProp('title', `You do not have permission to view this reference`);
    expect(wrapper.find(Icon).at(3)).not.toHaveProp('title', `You do not have permission to view this reference`);
    wrapper.unmount();
  });
});

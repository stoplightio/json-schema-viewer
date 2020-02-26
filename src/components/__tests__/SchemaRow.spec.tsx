import { TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { SchemaTree } from '../../tree';
import { metadataStore } from '../../tree/metadata';
import { SchemaKind, SchemaTreeListNode } from '../../types';
import { SchemaRow } from '../SchemaRow';
import { Validations } from '../shared/Validations';

describe('SchemaRow component', () => {
  test('should render falsy validations', () => {
    const node: SchemaTreeListNode = {
      id: '0.n1f7tvhzoj',
      name: '',
      parent: null,
    };

    metadataStore.set(node, {
      schemaNode: {
        name: '',
        id: '232',
        type: SchemaKind.Object,
        validations: {
          enum: [null, 0, false],
        },
        annotations: {},
        enum: [null, 0, false],
      } as any,
      schema: {} as any,
      path: [],
    });

    const rowOptions = {
      isEdited: false,
      isExpanded: true,
    };

    const wrapper = shallow(
      shallow(<SchemaRow node={node} rowOptions={rowOptions} />)
        .find(Validations)
        .shallow()
        .find(Popover)
        .prop('content') as React.ReactElement,
    );

    expect(wrapper).toHaveText('enum:null,0,false');
  });

  describe('required property', () => {
    let tree: SchemaTree;

    beforeEach(() => {
      const schema: JSONSchema4 = {
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

      tree = new SchemaTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
      });

      tree.populate();
      tree.unwrap(Array.from(tree)[1] as TreeListParentNode);
    });

    test('should preserve the required validation', () => {
      const wrapper = shallow(<SchemaRow node={Array.from(tree)[5]} rowOptions={{}} />);
      expect(wrapper.find(Validations)).toHaveProp('required', true);
    });

    test('should preserve the optional validation', () => {
      const wrapper = shallow(<SchemaRow node={Array.from(tree)[6]} rowOptions={{}} />);
      expect(wrapper.find(Validations)).toHaveProp('required', false);
    });

    describe('given a referenced object', () => {
      test('should preserve the required validation', () => {
        const wrapper = shallow(<SchemaRow node={Array.from(tree)[2]} rowOptions={{}} />);

        expect(wrapper.find(Validations)).toHaveProp('required', true);
      });

      test('should preserve the optional validation', () => {
        const wrapper = shallow(<SchemaRow node={Array.from(tree)[3]} rowOptions={{}} />);
        expect(wrapper.find(Validations)).toHaveProp('required', false);
      });
    });
  });
});

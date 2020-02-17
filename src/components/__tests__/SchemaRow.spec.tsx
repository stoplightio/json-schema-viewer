import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
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
});

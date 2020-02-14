import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import { SchemaTreeListNode } from '../../types';
import { SchemaRow } from '../SchemaRow';
import { Validations } from '../shared/Validations';

describe('SchemaRow component', () => {
  test('should render falsy validations', () => {
    const node: SchemaTreeListNode = {
      id: '0.n1f7tvhzoj',
      level: 0,
      name: '',
      metadata: {
        type: 'object',
        validations: {
          enum: [null, 0, false],
        },
        annotations: {},
        enum: [null, 0, false],
        path: [],
      } as any,
    };

    const rowOptions = {
      isEdited: false,
      isExpanded: true,
    };

    const wrapper = shallow(shallow(<SchemaRow node={node as SchemaTreeListNode} rowOptions={rowOptions} />)
      .find(Validations)
      .shallow()
      .find(Popover)
      .prop('content') as React.ReactElement);

    expect(wrapper).toHaveText('enum:null,0,false');
  });
});

import { TreeState } from '@stoplight/tree-list';
import { Dictionary } from '@stoplight/types';
import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { SchemaTree } from '../../tree';

import { getValidations } from '../../utils/getValidations';
import { SchemaPropertyRow, SchemaRow } from '../SchemaRow';
import { Format, Validations } from '../shared/Validations';

describe('Validations component', () => {
  describe('when property is deprecated', () => {
    let validations: Dictionary<unknown>;

    beforeEach(() => {
      validations = getValidations({ 'x-deprecated': true, type: 'string', minLength: 2, default: 'foo' });
    });

    test('should exclude deprecated from general validations', () => {
      const wrapper = shallow(<Validations required={false} validations={validations} />).find(Popover);

      expect(shallow(wrapper.prop('target') as React.ReactElement)).toHaveText('optional+2');
      expect(shallow(wrapper.prop('content') as React.ReactElement)).toHaveText('default:"foo"minLength:2');
    });

    test('should render deprecated box next to popover', () => {
      const wrapper = shallow(<Validations required={false} validations={validations} />).childAt(0);

      expect(wrapper).toHaveText('deprecated');
    });
  });
});

describe('Format', () => {
  let tree: SchemaTree;

  beforeEach(() => {
    const schema: JSONSchema4 = require('../../__fixtures__/formats-schema.json');

    tree = new SchemaTree(schema, new TreeState(), {
      expandedDepth: Infinity,
      mergeAllOf: false,
      resolveRef: void 0,
      shouldResolveEagerly: false,
      onPopulate: void 0,
    });

    tree.populate();
  });

  test('should render next to a single type with and inherit its color', () => {
    const wrapper = shallow(<SchemaRow node={tree.itemAt(3)!} rowOptions={{}} />)
      .find(SchemaPropertyRow)
      .shallow()
      .find(Format)
      .shallow();

    expect(wrapper).toHaveProp('className', 'ml-2 text-red-7 dark:text-red-6');
  });

  test('should render next to an array of types in default (black) color', () => {
    const wrapper = shallow(<SchemaRow node={tree.itemAt(1)!} rowOptions={{}} />)
      .find(SchemaPropertyRow)
      .shallow()
      .find(Format)
      .shallow();

    expect(wrapper).toHaveProp('className', 'ml-2');
  });

  test('should not render when the type(s) is/are missing', () => {
    const wrapper = shallow(<SchemaRow node={tree.itemAt(4)!} rowOptions={{}} />)
      .find(SchemaPropertyRow)
      .shallow();

    expect(wrapper).not.toContain(Format);
  });
});

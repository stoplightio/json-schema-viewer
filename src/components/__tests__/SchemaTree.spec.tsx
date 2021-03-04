import 'jest-enzyme';

import { Tree, TreeList, TreeState, TreeStore } from '@stoplight/tree-list';
import { shallow } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaTreeComponent } from '../index';

const schema: JSONSchema4 = {
  type: 'object',
  properties: {
    data: {
      items: {
        $ref: '#/definitions/Gif',
      },
      type: 'array',
    },
    meta: {
      $ref: '#/definitions/Meta',
    },
    pagination: {
      $ref: '#/definitions/Pagination',
    },
  },
};

describe('SchemaTree component', () => {
  let useCallbackSpy: jest.SpyInstance;
  let useStateSpy: jest.SpyInstance;
  let setStateActionSpy: jest.Mock;
  let store: TreeStore;

  beforeEach(() => {
    setStateActionSpy = jest.fn();
    useStateSpy = jest.spyOn(React, 'useState').mockImplementation(() => [{}, setStateActionSpy]);
    useCallbackSpy = jest.spyOn(React, 'useCallback');
    store = new TreeStore(new Tree(), new TreeState());
  });

  afterEach(() => {
    useStateSpy.mockRestore();
    useCallbackSpy.mockRestore();
  });

  describe('tree-list', () => {
    it('should be rendered', () => {
      const wrapper = shallow(<SchemaTreeComponent schema={schema} treeStore={store} />);

      expect(wrapper.find(TreeList)).toExist();
      expect(wrapper.find(TreeList)).toHaveProp({
        store,
      });
    });

    it('should be not draggable', () => {
      const treeList = shallow(<SchemaTreeComponent schema={schema} treeStore={store} />).find(TreeList);

      expect(treeList.prop('draggable')).toBe(false);
    });
  });
});

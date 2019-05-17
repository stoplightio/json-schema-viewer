import { TreeList, TreeStore } from '@stoplight/tree-list';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { SchemaTree } from '../components';
import { useMetadata } from '../hooks/useMetadata';

jest.mock('mobx-react-lite', () => ({
  observer: (children: any) => children,
}));
jest.mock('../hooks/useMetadata');

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
    (useMetadata as jest.Mock).mockReturnValue({});
    store = new TreeStore();
  });

  afterEach(() => {
    (useMetadata as jest.Mock).mockReset();
    useStateSpy.mockRestore();
    useCallbackSpy.mockRestore();
  });

  describe('tree-list', () => {
    test('should be rendered', () => {
      const wrapper = shallow(<SchemaTree schema={schema} treeStore={store} />);

      expect(wrapper.find(TreeList)).toExist();
      expect(wrapper.find(TreeList)).toHaveProp({
        store,
      });
    });

    test('should be not draggable', () => {
      const treeList = shallow(<SchemaTree schema={schema} treeStore={store} />).find(TreeList);

      expect(treeList.prop('canDrag')).toHaveLength(0);
      expect(treeList.prop('canDrag')!({} as any)).toBe(false);
    });
  });
});

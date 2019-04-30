import { TreeList, TreeListNode, TreeStore } from '@stoplight/tree-list';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { ReactElement } from 'react';
import { SchemaRow, SchemaTree, TopBar } from '../../components';
import { useMetadata } from '../../hooks';
import { ITreeNodeMeta } from '../../types';

jest.mock('../../theme');
jest.mock('../../hooks');

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
  let useStateSpy: jest.SpyInstance;
  let setStateActionSpy: jest.Mock;
  let store: TreeStore;

  beforeEach(() => {
    setStateActionSpy = jest.fn();
    useStateSpy = jest
      .spyOn(React, 'useState')
      .mockImplementation((initialValue: any) => [initialValue, setStateActionSpy]);
    (useMetadata as jest.Mock).mockReturnValue({});
    store = new TreeStore();
  });

  afterEach(() => {
    (useMetadata as jest.Mock).mockReset();
    useStateSpy.mockRestore();
  });

  describe('top bar', () => {
    test('should not be rendered if hideTopBar is truthy', () => {
      const wrapper = shallow(<SchemaTree schema={schema} treeStore={store} hideTopBar />);
      expect(wrapper.find(TopBar)).not.toExist();
    });

    test('should be rendered if name is given', () => {
      const wrapper = shallow(<SchemaTree schema={schema} treeStore={store} name="test" />);
      expect(wrapper.find(TopBar)).toExist();
      expect(wrapper.find(TopBar)).toHaveProp('name', 'test');
    });

    test('should be rendered if there is any metadata associated', () => {
      (useMetadata as jest.Mock).mockReturnValue({
        id: 'my-id',
        $schema: 'schema',
      });

      const wrapper = shallow(<SchemaTree schema={schema} treeStore={store} name="test" />);
      expect(wrapper.find(TopBar)).toExist();
      expect(wrapper.find(TopBar)).toHaveProp('name', 'test');
    });

    test('should always prioritize hideTopBar flag', () => {
      (useMetadata as jest.Mock).mockReturnValue({
        id: 'my-id',
        $schema: 'schema',
      });

      const wrapper = shallow(<SchemaTree schema={schema} treeStore={store} name="test" hideTopBar />);
      expect(wrapper.find(TopBar)).not.toExist();
    });
  });

  describe('tree-list', () => {
    test('should be rendered', () => {
      const wrapper = shallow(<SchemaTree schema={schema} treeStore={store} />);

      expect(wrapper.find(TreeList)).toExist();
      expect(wrapper.find(TreeList)).toHaveProp({
        store,
        top: 0,
        rowHeight: 40,
      });
    });

    test('should be not draggable', () => {
      const treeList = shallow(<SchemaTree schema={schema} treeStore={store} />).find(TreeList);

      expect(treeList.prop('canDrag')).toHaveLength(0);
      expect(treeList.prop('canDrag')!({} as any)).toBe(false);
    });

    test('should have extra padding if top bar is rendered', () => {
      const treeList = shallow(<SchemaTree schema={schema} treeStore={store} name="my-schema" />).find(TreeList);

      expect(treeList).toHaveProp('top', '40px');
    });

    test('should render property for each row', () => {
      const treeList = shallow(<SchemaTree schema={schema} treeStore={store} />).find(TreeList);
      const node: TreeListNode<ITreeNodeMeta> = {
        id: 'random-id',
        level: 0,
        name: '',
        metadata: {
          path: [],
        },
      };

      const rendered = treeList.prop('rowRenderer')!(node) as ReactElement<any>;

      expect(rendered).toMatchObject({
        type: SchemaRow,
        props: expect.objectContaining({
          node: node.metadata,
        }),
      });
    });
  });
});

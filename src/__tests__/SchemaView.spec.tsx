import { Button } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import { MutedText } from '../common/MutedText';
import { SchemaView } from '../SchemaView';

jest.mock('../theme');

const schema = {
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

describe('SchemaView', () => {
  let useStateSpy: jest.SpyInstance;
  let setStateActionSpy: jest.Mock;

  beforeAll(() => {
    setStateActionSpy = jest.fn();
    useStateSpy = jest
      .spyOn(React, 'useState')
      .mockImplementation((initialValue: any) => [initialValue, setStateActionSpy]);
  });

  afterAll(() => {
    useStateSpy.mockRestore();
  });

  test('should render empty text if schema has no properties', () => {
    const emptyText = 'abc';
    const wrapper = shallow(<SchemaView emptyText={emptyText} schema={{}} schemas={{}} />);

    expect(wrapper).toContainReact(<MutedText>{emptyText}</MutedText>);
  });

  test('should limit display items to limitPropertyCount when limitPropertyCount > 0', () => {
    const wrapper = shallow(<SchemaView emptyText="" schema={schema} schemas={{}} limitPropertyCount={2} />);

    expect(wrapper.children()).toHaveLength(3);
  });

  test('should hide expand button when limitPropertyCount <= 0', () => {
    const wrapper = shallow(<SchemaView emptyText="" schema={schema} schemas={{}} limitPropertyCount={0} />);

    expect(wrapper.find(Button)).not.toExist();
  });

  test('should toggle showExtra on btn click', () => {
    const wrapper = shallow(<SchemaView emptyText="" schema={schema} schemas={{}} limitPropertyCount={2} />);

    wrapper.find(Button).simulate('click');
    expect(setStateActionSpy).toHaveBeenLastCalledWith(true);
  });
});

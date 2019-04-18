import { Button } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { MutedText } from '../components/common/MutedText';
import { Property } from '../components/Property';
import { SchemaView } from '../SchemaView';
import { useMetadata } from '../hooks/useMetadata';

jest.mock('../theme');
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

describe('SchemaView component', () => {
  let useStateSpy: jest.SpyInstance;
  let setStateActionSpy: jest.Mock;

  beforeEach(() => {
    setStateActionSpy = jest.fn();
    useStateSpy = jest
      .spyOn(React, 'useState')
      .mockImplementation((initialValue: any) => [initialValue, setStateActionSpy]);
    (useMetadata as jest.Mock).mockReturnValue({});
  });

  afterEach(() => {
    (useMetadata as jest.Mock).mockReset();
    useStateSpy.mockRestore();
  });


  test('should hide expand button when limitPropertyCount is undefined', () => {
    (useProperties as jest.Mock).mockReturnValue({
      isOverflow: false,
      properties: [...new Array(5)],
    });
    const wrapper = shallow(<SchemaView schema={schema} />);

    expect(wrapper.find(Button)).not.toExist();
  });

  test('should toggle showExtra on btn click', () => {
    (useProperties as jest.Mock).mockReturnValue({
      isOverflow: true,
      properties: [...new Array(5)],
    });
    const wrapper = shallow(<SchemaView emptyText="" schema={schema} limitPropertyCount={2} />);

    wrapper.find(Button).simulate('click');
    expect(setStateActionSpy).toHaveBeenLastCalledWith(true);
  });
});

import { Button } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { MutedText } from '../components/common/MutedText';
import { Property } from '../components/Property';
import { useProperties } from '../hooks/useProperties';
import { SchemaView } from '../SchemaView';

jest.mock('../theme');
jest.mock('../hooks/useProperties');

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
  });

  afterEach(() => {
    useStateSpy.mockRestore();
  });

  test('should render empty text if schema has no properties', () => {
    (useProperties as jest.Mock).mockReturnValue({
      isOverflow: false,
      properties: [],
    });
    const emptyText = 'abc';
    const wrapper = shallow(<SchemaView emptyText={emptyText} schema={{}} />);

    expect(wrapper).toContainReact(<MutedText>{emptyText}</MutedText>);
  });

  it('should call useProperties hook and render properties', () => {
    (useProperties as jest.Mock).mockReturnValue({
      isOverflow: true,
      properties: [...new Array(3)],
    });
    const dereferencedSchema: JSONSchema4 = { type: 'object' };
    const wrapper = shallow(
      <SchemaView
        emptyText=""
        schema={schema}
        dereferencedSchema={dereferencedSchema}
        defaultExpandedDepth={1}
        limitPropertyCount={2}
      />
    );

    expect(useProperties).toHaveBeenCalledWith(schema, dereferencedSchema, {
      limitPropertyCount: 2,
      defaultExpandedDepth: 1,
      expandedRows: {
        all: false,
      },
    });

    expect(wrapper.find(Property)).toHaveLength(3);
  });

  test('should hide expand button when limitPropertyCount is undefined', () => {
    (useProperties as jest.Mock).mockReturnValue({
      isOverflow: false,
      properties: [...new Array(5)],
    });
    const wrapper = shallow(<SchemaView emptyText="" schema={schema} />);

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

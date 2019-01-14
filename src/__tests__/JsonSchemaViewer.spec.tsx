/* @jsx jsx */
import { jsx } from '@emotion/core';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { MutedText } from '../common/MutedText';
import { JsonSchemaViewer } from '../JsonSchemaViewer';
import { SchemaView } from '../SchemaView';
import { isSchemaViewerEmpty } from '../util/isSchemaViewerEmpty';

jest.mock('../theme');
jest.mock('../util/isSchemaViewerEmpty');

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

describe('JSON Schema Viewer component', () => {
  test('should render empty message if schema is empty', () => {
    // @ts-ignore storybook has some issues with (isSchemaViewer as jest.Mock)
    isSchemaViewerEmpty.mockReturnValue(true);
    const wrapper = shallow(<JsonSchemaViewer schemas={{}} schema={{}} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith({});
    expect(wrapper.find(MutedText)).toExist();
    expect(wrapper.find(SchemaView)).not.toExist();
  });

  test('should render SchemaView if schema is provided', () => {
    // @ts-ignore storybook has some issues with (isSchemaViewer as jest.Mock)
    isSchemaViewerEmpty.mockReturnValue(false);
    const wrapper = shallow(<JsonSchemaViewer schemas={{}} schema={schema} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith(schema);
    expect(wrapper.find(MutedText)).not.toExist();
    expect(wrapper.find(SchemaView)).toExist();
  });
});

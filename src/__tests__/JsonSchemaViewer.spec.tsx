import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import { MutedText } from '../components/common/MutedText';
import { JsonSchemaViewer } from '../JsonSchemaViewer';
import { SchemaView } from '../SchemaView';
import { isSchemaViewerEmpty } from '../utils/isSchemaViewerEmpty';

jest.mock('../theme');
jest.mock('../utils/isSchemaViewerEmpty');

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
    (isSchemaViewerEmpty as jest.Mock).mockReturnValue(true);
    const wrapper = shallow(<JsonSchemaViewer schema={{}} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith({});
    expect(wrapper.find(MutedText)).toExist();
    expect(wrapper.find(SchemaView)).not.toExist();
  });

  test('should render SchemaView if schema is provided', () => {
    (isSchemaViewerEmpty as jest.Mock).mockReturnValue(false);
    const wrapper = shallow(<JsonSchemaViewer schema={schema} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith(schema);
    expect(wrapper.find(MutedText)).not.toExist();
    expect(wrapper.find(SchemaView)).toExist();
  });
});

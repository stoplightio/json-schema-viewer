import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';

import { JSONSchema4 } from 'json-schema';
import { JsonSchemaViewerComponent, SchemaTree } from '../../components';
import { isSchemaViewerEmpty } from '../../utils/isSchemaViewerEmpty';

jest.mock('../../utils/isSchemaViewerEmpty');

const schema: JSONSchema4 = {
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
    const wrapper = shallow(<JsonSchemaViewerComponent schema={{}} getRefDetails={jest.fn()} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith({});
    expect(wrapper.find(SchemaTree)).not.toExist();
  });

  test('should render SchemaView if schema is provided', () => {
    (isSchemaViewerEmpty as jest.Mock).mockReturnValue(false);
    const wrapper = shallow(<JsonSchemaViewerComponent schema={schema as JSONSchema4} getRefDetails={jest.fn()} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith(schema);
    expect(wrapper.find(SchemaTree)).toExist();
  });
});

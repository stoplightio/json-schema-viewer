import 'jest-enzyme';

import { shallow } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { JsonSchemaViewer, SchemaTree } from '../../components';
import { isSchemaViewerEmpty } from '../../utils/isSchemaViewerEmpty';

jest.mock('../../utils/isSchemaViewerEmpty');
jest.mock('../../components/SchemaTree', () => ({
  SchemaTree() {
    return <div />;
  },
}));

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
  beforeEach(() => {
    (isSchemaViewerEmpty as jest.Mock).mockReturnValue(false);
  });

  it('should render empty message if schema is empty', () => {
    (isSchemaViewerEmpty as jest.Mock).mockReturnValue(true);
    const wrapper = shallow(<JsonSchemaViewer schema={{}} onError={jest.fn()} />)
      .dive()
      .dive();
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith({});
    expect(wrapper.find(SchemaTree)).not.toExist();
  });

  it('should render SchemaView if schema is provided', () => {
    const wrapper = shallow(<JsonSchemaViewer schema={schema as JSONSchema4} onError={jest.fn()} />)
      .dive()
      .dive();
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith(schema);
    expect(wrapper.find(SchemaTree)).toExist();
  });
});

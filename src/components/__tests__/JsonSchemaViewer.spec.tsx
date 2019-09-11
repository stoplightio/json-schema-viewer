import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';

import { JSONSchema4 } from 'json-schema';
import { JsonSchemaViewerComponent, SchemaTree } from '../../components';
import { isSchemaViewerEmpty } from '../../utils/isSchemaViewerEmpty';
import { renderSchema } from '../../utils/renderSchema';

const { default: SchemaWorker } = require('../../workers/schema');

jest.mock('../../utils/isSchemaViewerEmpty');
jest.mock('../../workers/schema');
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
    (SchemaWorker.prototype.postMessage as jest.Mock).mockClear();
    (SchemaWorker.prototype.addEventListener as jest.Mock).mockClear();
  });

  afterEach(() => {
    delete SchemaWorker.prototype.isShim;
  });

  test('should render empty message if schema is empty', () => {
    (isSchemaViewerEmpty as jest.Mock).mockReturnValue(true);
    const wrapper = shallow(<JsonSchemaViewerComponent schema={{}} onError={jest.fn()} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith({});
    expect(wrapper.find(SchemaTree)).not.toExist();
  });

  test('should render SchemaView if schema is provided', () => {
    const wrapper = shallow(<JsonSchemaViewerComponent schema={schema as JSONSchema4} onError={jest.fn()} />);
    expect(isSchemaViewerEmpty).toHaveBeenCalledWith(schema);
    expect(wrapper.find(SchemaTree)).toExist();
  });

  test('should not perform full processing in a worker if provided schema has fewer nodes than maxRows', () => {
    const wrapper = shallow(
      <JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={10} onError={jest.fn()} />,
    );
    expect(SchemaWorker.prototype.postMessage).not.toHaveBeenCalled();
    expect(wrapper.instance()).toHaveProperty('treeStore.nodes.length', 4);
  });

  test('should perform full processing in a worker under all circumstances if mergeAllOf is not false and allOf combiner is found', () => {
    const schemaAllOf: JSONSchema4 = {
      allOf: [
        {
          properties: {
            Object1Property: {
              type: 'string',
              minLength: 1,
              'x-val': 'lol',
            },
          },
        },
      ],
    };

    shallow(<JsonSchemaViewerComponent schema={schemaAllOf} maxRows={10} onError={jest.fn()} />);

    expect(SchemaWorker.prototype.postMessage).toHaveBeenCalledWith({
      instanceId: expect.any(String),
      mergeAllOf: true,
      schema: schemaAllOf,
    });
  });

  test('should not perform full processing in a worker when an allOf combiner is found but mergeAllOf is false', () => {
    const schemaAllOf: JSONSchema4 = {
      allOf: [
        {
          properties: {
            Object1Property: {
              type: 'string',
              minLength: 1,
              'x-val': 'lol',
            },
          },
        },
      ],
    };

    shallow(<JsonSchemaViewerComponent schema={schemaAllOf} maxRows={10} mergeAllOf={false} onError={jest.fn()} />);

    expect(SchemaWorker.prototype.postMessage).not.toHaveBeenCalledWith();
  });

  test('should pre-render maxRows nodes and perform full processing in a worker if provided schema has more nodes than maxRows', () => {
    const wrapper = shallow(
      <JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={1} onError={jest.fn()} />,
    );
    expect(SchemaWorker.prototype.postMessage).toHaveBeenCalledWith({
      instanceId: expect.any(String),
      mergeAllOf: true,
      schema,
    });

    // pre-rendered
    expect(wrapper.instance()).toHaveProperty('treeStore.nodes', [
      {
        canHaveChildren: true,
        id: expect.any(String),
        level: 0,
        metadata: {
          id: expect.any(String),
          path: [],
          annotations: {},
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
          type: 'object',
          validations: {},
        },
        name: '',
      },
    ]);

    const nodes = Array.from(renderSchema(schema));

    SchemaWorker.prototype.addEventListener.mock.calls[0][1]({
      data: {
        instanceId: SchemaWorker.prototype.postMessage.mock.calls[0][0].instanceId,
        error: null,
        nodes,
      },
    });

    expect(wrapper.instance()).toHaveProperty('treeStore.nodes', nodes);
  });

  test('should render all nodes on main thread when worker cannot be spawned regardless of maxRows or schema', () => {
    SchemaWorker.prototype.isShim = true;
    const wrapper = shallow(
      <JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={1} onError={jest.fn()} />,
    );

    expect(SchemaWorker.prototype.postMessage).not.toHaveBeenCalled();
    expect(wrapper.instance()).toHaveProperty('treeStore.nodes.length', 4);
  });

  test('should handle exceptions that may occur during full rendering', () => {
    const onError = jest.fn();
    shallow(<JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={1} onError={onError} />);

    SchemaWorker.prototype.addEventListener.mock.calls[0][1]({
      data: {
        instanceId: SchemaWorker.prototype.postMessage.mock.calls[0][0].instanceId,
        error: 'error occurred',
        nodes: null,
      },
    });

    expect(onError).toHaveBeenCalledWith(new Error('error occurred'));
  });

  test('should not apply result of full processing in a worker if instance ids do not match', () => {
    const wrapper = shallow(
      <JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={0} onError={jest.fn()} />,
    );
    expect(SchemaWorker.prototype.postMessage).toHaveBeenCalledWith({
      instanceId: expect.any(String),
      mergeAllOf: true,
      schema,
    });

    const nodes = Array.from(renderSchema(schema));

    SchemaWorker.prototype.addEventListener.mock.calls[0][1]({
      data: {
        instanceId: 'foooo',
        nodes,
      },
    });

    expect(wrapper.instance()).toHaveProperty('treeStore.nodes', []);
  });

  test('should create one shared instance of schema worker one mounted for a first time and keep it', () => {
    const worker = (shallow(
      <JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={0} onError={jest.fn()} />,
    ).instance()!.constructor as any).schemaWorker;

    expect(SchemaWorker).toHaveBeenCalledTimes(1);

    expect(worker).toBe(
      (shallow(<JsonSchemaViewerComponent schema={schema as JSONSchema4} maxRows={0} onError={jest.fn()} />).instance()!
        .constructor as any).schemaWorker,
    );

    expect(SchemaWorker).toHaveBeenCalledTimes(1);
  });
});

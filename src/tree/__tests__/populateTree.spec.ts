import { Tree } from '@stoplight/tree-list';
import * as fs from 'fs';
import * as path from 'path';
import { generateId } from '../../utils/generateId';
import { populateTree } from '../populateTree';

const BASE_PATH = path.resolve(__dirname, '../../__fixtures__/');

jest.mock('../../utils/generateId', () => ({
  generateId: jest.fn(() => 'random-id'),
}));

describe('populateTree util', () => {
  it.each([
    'default-schema.json',
    'ref/original.json',
    'combiner-schema.json',
    'array-of-objects.json',
    'array-of-refs.json',
    'array-of-allofs.json',
    'todo-allof.schema.json',
    'tickets.schema.json',
    'nullish-ref.schema.json',
  ])('should match %s', filename => {
    const schema = JSON.parse(fs.readFileSync(path.resolve(BASE_PATH, filename), 'utf8'));
    const root = Tree.createArtificialRoot();
    root.id = generateId();
    populateTree(schema, root, 0, [], null);
    expect(root).toMatchSnapshot();
  });

  it.each([
    'default-schema.json',
    'ref/original.json',
    'combiner-schema.json',
    'array-of-objects.json',
    'array-of-refs.json',
    'array-of-allofs.json',
    'tickets.schema.json',
  ])('should not mutate original object %s', filename => {
    const content = fs.readFileSync(path.resolve(BASE_PATH, filename), 'utf8');
    const schema = JSON.parse(content);

    const root = Tree.createArtificialRoot();
    populateTree(schema, root, 0, [], null);
    expect(schema).toStrictEqual(JSON.parse(content));
  });

  it('given schema with complex types, throws', () => {
    const schema = {
      type: [
        'null',
        {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      ],
    };

    const root = Tree.createArtificialRoot();
    expect(() => populateTree(schema as any, root, 0, [], null)).toThrow(
      'The "type" property must be a string, or an array of strings. Objects and array of objects are not valid.',
    );
  });
});

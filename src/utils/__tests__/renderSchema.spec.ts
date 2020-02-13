import * as fs from 'fs';
import * as path from 'path';
import { generateTree } from '../../tree/renderSchema';

const BASE_PATH = path.resolve(__dirname, '../../__fixtures__/');

jest.mock('../generateId', () => ({
  generateId: jest.fn(() => 'random-id'),
}));

describe('renderSchema util', () => {
  it.each([
    'default-schema.json',
    'ref/original.json',
    'combiner-schema.json',
    'array-of-objects.json',
    'array-of-refs.json',
    'array-of-allofs.json',
    'tickets.schema.json',
  ])('should match %s', schema => {
    expect(
      Array.from(generateTree(JSON.parse(fs.readFileSync(path.resolve(BASE_PATH, schema), 'utf8')))),
    ).toMatchSnapshot();
  });

  it.each([
    'default-schema.json',
    'ref/original.json',
    'combiner-schema.json',
    'array-of-objects.json',
    'array-of-refs.json',
    'array-of-allofs.json',
    'tickets.schema.json',
  ])('should not mutate original object %s', schema => {
    const content = fs.readFileSync(path.resolve(BASE_PATH, schema), 'utf8');
    const input = JSON.parse(content);

    Array.from(generateTree(input));

    expect(input).toStrictEqual(JSON.parse(content));
  });

  it('given schema with complex types, throws', () => {
    expect(() =>
      Array.from(
        generateTree({
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
        } as any),
      ),
    ).toThrow(
      'The "type" property must be a string, or an array of strings. Objects and array of objects are not valid.',
    );
  });
});

import * as fs from 'fs';
import * as path from 'path';
import { renderSchema } from '../renderSchema';

const BASE_PATH = path.resolve(__dirname, '../../__fixtures__/');

jest.mock('../generateId', () => ({
  generateId: jest.fn(() => 'random-id'),
}));

describe('renderSchema util', () => {
  it.each([
    ['default-schema.json', ''],
    ['ref/original.json', 'ref/resolved.json'],
    ['combiner-schema.json', ''],
    ['array-of-objects.json', ''],
    ['array-of-refs.json', ''],
    ['array-of-allofs.json', ''],
    ['tickets.schema.json', ''],
  ])('should match %s', (schema, dereferenced) => {
    expect(
      Array.from(renderSchema(JSON.parse(fs.readFileSync(path.resolve(BASE_PATH, schema), 'utf8')))),
    ).toMatchSnapshot();
  });

  it('given schema with complex types, throws', () => {
    expect(() =>
      Array.from(
        renderSchema({
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

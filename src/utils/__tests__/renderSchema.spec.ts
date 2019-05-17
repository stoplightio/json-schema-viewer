import * as fs from 'fs';
import * as path from 'path';
import { renderSchema } from '../renderSchema';

const BASE_PATH = path.resolve(__dirname, '../../__fixtures__/');

jest.mock('../assignId', () => ({
  assignId: jest.fn(() => 'random-id'),
}));

describe('renderSchema util', () => {
  it.each([
    ['default-schema.json', ''],
    ['ref/original.json', 'ref/resolved.json'],
    ['combiner-schema.json', ''],
    ['array-of-objects.json', ''],
    ['array-of-refs.json', ''],
  ])('should match %s', (schema, dereferenced) => {
    expect(
      Array.from(
        renderSchema(
          JSON.parse(fs.readFileSync(path.resolve(BASE_PATH, schema), 'utf-8')),
          dereferenced ? JSON.parse(fs.readFileSync(path.resolve(BASE_PATH, dereferenced), 'utf-8')) : undefined
        )
      )
    ).toMatchSnapshot();
  });
});

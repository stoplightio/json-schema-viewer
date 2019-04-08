import { renderSchema } from '../renderSchema';

jest.mock('../../theme');

describe('renderSchema function', () => {
  test.each(['all-of', 'properties', 'nested-properties'])('should render proper tree given schema %s.json', schema => {
    expect(
      renderSchema({
        schemas: {},
        schema: require(`../__fixtures__/${schema}.json`),
        rowElems: [],
        level: 0,
        defaultExpandedDepth: 1,
        expandedRows: {
          all: true,
        },
        toggleExpandRow: jest.fn(),
        path: [],
      })
    ).toMatchSnapshot();
  });
});

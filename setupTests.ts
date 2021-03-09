import '@testing-library/jest-dom';

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

jest.mock('react-virtualized-auto-sizer', () => ({ children }: any) => children({ height: 600, width: 600 }));

Enzyme.configure({ adapter: new Adapter() });

jest.mock('react');

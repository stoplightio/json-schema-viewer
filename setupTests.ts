const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

jest.mock('react');

const observe = jest.fn();
const unobserve = jest.fn();
const disconnect = jest.fn();

// @ts-ignore
window.IntersectionObserver = jest.fn(() => ({
  observe,
  unobserve,
  disconnect,
}));

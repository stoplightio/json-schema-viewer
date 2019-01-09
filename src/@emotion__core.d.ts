// a dumb stub, workaround for storybook emotion problem
// can be removed once Storybook v5 is released and we can have own @emotion/core installed
declare module '@emotion/core' {
  import { createElement } from 'react';

  export const jsx: typeof createElement;
  export const css: Function;
}

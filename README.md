# @stoplight/json-schema-viewer

<!-- BADGES -->

A JSON Schema viewer React component

- Explore the components: [Storybook](https://stoplightio.github.io/json-schema-viewer)
- View the changelog: [Releases](https://github.com/stoplightio/json-schema-viewer/releases)

### Features

- Full JSON Schema Draft 4 support, including `oneOf` and `anyOf` combiner properties
- Renders complicated nested objects to any depth
- Renders validation properties and markdown descriptions
- Theme-able
- Collapsible

### Installation

Supported in modern browsers and node.

```bash
# latest stable
yarn add @stoplight/json-schema-viewer
```

### Usage

```js
export const theme = {
  base: 'dark',

  canvas: {
    bg: '#111',
    fg: '#fff',
    error: 'red',
    muted: 'rgba(255, 255, 255, 0.6)',
  },

  divider: {
    bg: '#bababa',
  },

  row: {
    hoverBg: '#333',
    hoverFg: '#fff',
    evenBg: '#232222',
  },

  types: {
    object: '#83c1ff',
    array: '#7dff75',
    allOf: '#b89826',
    oneOf: '#b89826',
    anyOf: '#b89826',
    null: '#ff7f50',
    integer: '#e03b36',
    number: '#e03b36',
    boolean: '#ff69b4',
    binary: '#8ccda3',
    string: '#19c5a0',
    $ref: '#a359e2',
  },
};
```

```jsx
import { JsonSchemaViewer, ThemeProvider } from "@stoplight/json-schema-viewer";
import { theme } from './theme';

<ThemeProvider theme={theme}>
  <JsonSchemaViewer schemas={schemas} schema={schema} expanded />
</ThemeProvider>
```

More examples can be find in the [Storybook stories](./src/__stories__/JsonSchemaViewer.tsx).

### Contributing

1. Clone repo.
2. Create / checkout `feature/{name}`, `chore/{name}`, or `fix/{name}` branch.
3. Install deps: `yarn`.
4. Make your changes.
5. Run tests: `yarn test.prod`.
6. Stage relevant files to git.
7. Commit: `yarn commit`. _NOTE: Commits that don't follow the [conventional](https://github.com/marionebl/commitlint/tree/master/%40commitlint/config-conventional) format will be rejected. `yarn commit` creates this format for you, or you can put it together manually and then do a regular `git commit`._
8. Push: `git push`.
9. Open PR targeting the `develop` branch.

import * as React from 'react';
import { withOptions } from '@storybook/addon-options';
import { addDecorator, configure } from '@storybook/react';

import '@stoplight/tree-list/styles/_tree-list.scss';
import '@stoplight/ui-kit/styles/_ui-kit.scss';
import { ThemeContainer } from '@stoplight/ui-kit';

addDecorator(
  withOptions({
    name: 'Stoplight Json Schema Viewer',
    url: 'https://github.com/stoplightio/json-schema-viewer',
    goFullScreen: false,
    showStoriesPanel: true,
    showAddonPanel: true,
    showSearchBox: false,
    addonPanelInRight: true,
    sortStoriesByKind: true,
    hierarchySeparator: /\//,
    hierarchyRootSeparator: /:/,
    selectedAddonPanel: undefined,
  }),
);

function loadStories() {
  require('@project/stories');
}

addDecorator(story => <ThemeContainer>{story()}</ThemeContainer>);

configure(loadStories, module);

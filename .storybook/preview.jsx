import * as React from 'react';
import { Box, Provider as MosaicProvider } from '@stoplight/mosaic';
import { Title, Subtitle, Description, Primary, ArgsTable, PRIMARY_STORY } from '@storybook/addon-docs/blocks';
import customTheme from './theme';
import { injectStyles } from '@stoplight/mosaic';

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
    },
  },
};

const MosaicProviderDecorator = Story => {
  injectStyles();

  return (
    <MosaicProvider>
      <Box mx="auto" py={20} px={8} style={{ maxWidth: 800 }}>
        <Story />
      </Box>
    </MosaicProvider>
  );
};

export const decorators = [MosaicProviderDecorator];

export const parameters = {
  docs: {
    page: () => (
      <>
        <Title />
        <Subtitle />
        <Description />
        <Primary />
        <ArgsTable story={PRIMARY_STORY} />
      </>
    ),
    theme: customTheme,
  },
  storySort: {
    order: ['Default'],
  },
};

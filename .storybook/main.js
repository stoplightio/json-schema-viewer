module.exports = {
  framework: '@storybook/react',
  stories: ['../src/__stories__/*.tsx'],
  addons: ['@storybook/addon-essentials'],
  core: {
    builder: "webpack5"
  },
  // From https://github.com/hipstersmoothie/react-docgen-typescript-plugin/issues/78#issuecomment-1409224863
  typescript: {
    reactDocgen: 'react-docgen-typescript-plugin'
  },
};

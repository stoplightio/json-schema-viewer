module.exports = {
  framework: '@storybook/react',
  stories: ['../src/__stories__/*.tsx'],
  addons: ['@storybook/addon-essentials'],
  core: {
    builder: "webpack5"
  }
};

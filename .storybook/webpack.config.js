const defaultConfig = require('@stoplight/storybook-config/webpack.config');
const path = require('path');

module.exports = (baseConfig, env, config) => {
  config = defaultConfig(baseConfig, env, config);

  config.output.globalObject = 'this';

  return config;
};

const defaultConfig = require('@stoplight/storybook-config/webpack.config');

module.exports = (baseConfig, env, config) => {
  config = defaultConfig(baseConfig, env, config);

  // ... further customize if needed

  return config;
};

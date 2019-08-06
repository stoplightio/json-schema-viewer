const defaultConfig = require('@stoplight/storybook-config/webpack.config');
const path = require('path');

module.exports = (baseConfig, env, config) => {
  config = defaultConfig(baseConfig, env, config);

  config.output.globalObject = 'this';
  config.resolve.alias['web-worker:../workers/schema.ts'] = path.join(process.cwd(), './src/__stories__/worker.shim.ts');

  return config;
};

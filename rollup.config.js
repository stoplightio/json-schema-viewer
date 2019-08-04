import config from '@stoplight/scripts/rollup.config';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

config.plugins.push(
  resolve({
    only: ['json-schema-merge-allof', /lodash\/?.*/],
  }),
  webWorkerLoader({
    inline: true,
  }),
  commonjs(),
);

export default config;

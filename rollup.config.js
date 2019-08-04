import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import config from '@stoplight/scripts/rollup.config';
const typescript = require('rollup-plugin-typescript2');
import autoExternal from 'rollup-plugin-auto-external';

config.plugins = [
  autoExternal(),
  typescript({
    tsconfig: './tsconfig.json',
    include: ['src/**/*.{ts,tsx}'],
  }),
  webWorkerLoader({
    inline: true,
  }),
];

export default config;

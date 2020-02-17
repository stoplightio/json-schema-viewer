import config from '@stoplight/scripts/rollup.config';
import commonjs from 'rollup-plugin-commonjs';

config.plugins.push(commonjs());

export default config;

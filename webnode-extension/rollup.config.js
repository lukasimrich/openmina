import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { wasm } from '@rollup/plugin-wasm';

export default {
  input: 'index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  plugins: [
    resolve(),
    commonjs(),
    wasm(),
  ],
};

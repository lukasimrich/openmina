import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { wasm } from '@rollup/plugin-wasm';

export default [
  // ES module bundle for offscreen document
  {
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
  },
  // IIFE bundle for classic worker
  {
    input: 'index.js',
    output: {
      file: 'dist/worker-bundle.js',
      format: 'iife',
      name: 'OpenMinaWorker',
    },
    plugins: [
      resolve(),
      commonjs(),
      wasm(),
    ],
  }
];

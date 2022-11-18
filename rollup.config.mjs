import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

// Always provide both CJS and ES exports
const rollupconfig = [
  {
    input: `ts_src/index.ts`,
    plugins: [esbuild(), json()],
    output: [
      {
        dir: 'esm',
        format: 'esm',
        preserveModules: true,
      },
      {
        file: 'dist/index.js',
        format: 'cjs',
      },
    ],
    external: [
      'create-hash',
      'pbkdf2',
      'randombytes',
    ],
  },
  {
    input: `ts_src/index.ts`,
    plugins: [dts()],
    output: [
      {
        dir: 'esm',
        format: 'esm',
        preserveModules: true,
      },
      {
        file: 'dist/index.d.ts',
        format: 'cjs',
      },
    ],
  },
];

export default rollupconfig;

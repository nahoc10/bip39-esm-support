import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

// Always provide both CJS and ES exports
const sharedRollupConfig = [
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
      'big.js',
      'bitcoinjs-lib',
      'bn.js',
      'coinselect',
      'ethers',
      'graphql-request',
      'graphql',
      'react-dom',
      'react-router-dom',
      'react',
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

export default sharedRollupConfig;

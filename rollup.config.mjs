import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import { readFileSync } from 'fs'

const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf8'))

const tsOpts = {
  compilerOptions: {
    ...tsconfig.compilerOptions,
    module: 'ESNext',
    declaration: false,
  },
  exclude: ['**/__tests__/**'],
}

export default [
  // Build 1: ESM for Node.js (full functionality)
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.mjs',
      format: 'es',
      sourcemap: true,
    },
    external: ['fast-glob', 'node:url'],
    plugins: [typescript(tsOpts)],
    treeshake: { moduleSideEffects: 'no-external' },
  },
  // Build 2: ESM for edge runtimes (findControllers stubbed - no filesystem access)
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.edge.mjs',
      format: 'es',
      sourcemap: true,
    },
    external: ['fast-glob', 'node:url'],
    plugins: [
      replace({
        delimiters: ['', ''],
        preventAssignment: true,
        // Stub out the findControllers export
        "export * from './find-controllers'":
          `export const findControllers = () => { throw new Error('findControllers is not supported in edge runtimes without filesystem access.') }`,
      }),
      typescript(tsOpts),
    ],
    treeshake: { moduleSideEffects: 'no-external' },
  },
]

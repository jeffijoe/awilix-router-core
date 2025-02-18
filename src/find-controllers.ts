import * as glob from 'fast-glob'

import { IStateAndTarget, getStateAndTarget } from './state-util'
import { pathToFileURL } from 'node:url'

/**
 * Find Controllers options for module finding and import resolution.
 */
export type FindControllersOptions<ESM extends boolean = false> =
  glob.Options & {
    /**
     * When `true`, the function will use ESM `import` and return a `Promise`; otherwise
     * uses `require` and is synchronous.
     */
    esModules?: ESM
    /**
     * The `import` function to use. Defaults to the global `import`.
     * This is only used for testing.
     *
     * @private
     */
    import?: ESM extends true ? (path: string) => Promise<any> : never
  }

/**
 * Find Controllers result.
 */
export type FindControllersResult = Array<IStateAndTarget>

export function findControllers<ESM extends boolean = false>(
  pattern: string,
  opts?: FindControllersOptions<ESM>,
): ESM extends true ? Promise<FindControllersResult> : FindControllersResult
/**
 * Finds classes using the specified pattern and options.
 *
 * @param pattern Glob pattern
 * @param opts Glob options and ES modules dynamic import module loading
 */
export function findControllers<ESM extends boolean>(
  pattern: string,
  opts?: FindControllersOptions<ESM>,
): Promise<FindControllersResult> | FindControllersResult {
  const result = glob.sync(pattern, opts)

  /* istanbul ignore next: can't cover because we are replacing the importer in tests. */
  const importFn = opts?.import ?? ((path) => import(path))

  if (opts && opts.esModules === true) {
    return Promise.all(
      result.map((path) =>
        importFn(pathToFileURL(path).toString()).then(
          extractStateAndTargetFromExports,
        ),
      ),
    ).then((controllers) =>
      controllers.reduce((acc, cur) => acc.concat(cur), []),
    )
  } else {
    return result
      .map((path) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const exports = require(path)
        return extractStateAndTargetFromExports(exports)
      })
      .reduce((acc, cur) => acc.concat(cur), [])
  }
}

function extractStateAndTargetFromExports(exports: any): FindControllersResult {
  const items: FindControllersResult = []

  if (exports) {
    const stateAndTarget = getStateAndTarget(exports)
    if (stateAndTarget) {
      items.push(stateAndTarget)
      return items
    }

    // loop through exports - this will cover named as well as a default export
    for (const key of Object.keys(exports)) {
      const stateAndTarget = getStateAndTarget(exports[key])
      if (stateAndTarget) {
        items.push(stateAndTarget)
      }
    }
  }

  return items
}

import * as glob from 'glob'
import { IStateAndTarget, getStateAndTarget } from './state-util'

/**
 * Find Controllers result.
 */
export type FindControllersResult = Array<IStateAndTarget>

/**
 * Finds classes using the specified pattern and options.
 *
 * @param pattern Glob pattern
 * @param opts Glob options
 */
export function findControllers(
  pattern: string,
  opts?: glob.IOptions
): FindControllersResult {
  const result = glob.sync(pattern, opts)
  return result
    .map(path => {
      let required = require(path)

      // Support default exports (ES6).
      if (required.default) {
        required = required.default
      }

      return getStateAndTarget(required)
    })
    .filter(x => x !== null) as FindControllersResult
}

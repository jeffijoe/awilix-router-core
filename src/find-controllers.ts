import * as glob from 'fast-glob'
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
  opts?: glob.Options,
): FindControllersResult {
  const result = glob.sync(pattern, opts)
  return result
    .map((path) => {
      const items: Array<IStateAndTarget | null> = []

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const required = require(path)

      if (required) {
        const stateAndTarget = getStateAndTarget(required)
        if (stateAndTarget) {
          items.push(stateAndTarget)
          return items
        }

        // loop through exports - this will cover named as well as a default export
        for (const key of Object.keys(required)) {
          items.push(getStateAndTarget(required[key]))
        }
      }

      return items
    })
    .reduce((acc, cur) => acc.concat(cur), [])
    .filter((x) => x !== null) as FindControllersResult
}

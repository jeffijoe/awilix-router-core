import * as glob from 'glob'
import { IRouterConfigState, getState } from './state-util'
import { IS_CONTROLLER_BUILDER } from './symbols'

/**
 * Basic constructor type.
 */
export type Constructor = new (...args: Array<any>) => any

/**
 * Find Controllers result.
 */
export type FindControllersResult = Array<{
  target: Constructor | Function
  state: IRouterConfigState
}>

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

      // Gets the correct target. For example, if using the controller builder,
      // we need to use the `target` property. If using decorators, the required
      // value *is* the target.
      const target = required[IS_CONTROLLER_BUILDER]
        ? required.target
        : required

      const state = getState(required)
      if (state) {
        return { target, state }
      }

      return null
    })
    .filter(x => x !== null) as FindControllersResult
}

import * as glob from 'glob'

/**
 * Finds classes using the specified pattern and options.
 *
 * @param pattern Glob pattern
 * @param opts Glob options
 */
export function findClasses(
  pattern: string,
  opts?: glob.IOptions
): Array<Function> {
  const result = glob.sync(pattern, opts)
  return result
    .map(path => {
      const required = require(path)
      if (typeof required === 'function') {
        return required
      }

      if (typeof required.default === 'function') {
        return required.default
      }

      return null
    })
    .filter(x => x)
}

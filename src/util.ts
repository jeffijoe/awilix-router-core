/**
 * Returns unique items.
 */
export function uniq<T>(src: Array<T>): Array<T> {
  const result: Array<T> = []
  src.forEach((t) => {
    if (result.indexOf(t) === -1) {
      result.push(t)
    }
  })

  return result
}

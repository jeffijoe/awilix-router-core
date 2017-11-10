/**
 * Asserts the condition and returns it, throws otherwise.
 *
 * @param condition Must be truthy, else throws. Returns the condition is truthy.
 * @param message The message to use when throwing.
 */
export function invariant<T>(
  condition: T | undefined | null,
  message: string
): T | never {
  if (!condition) {
    throw new Error(message)
  }

  return condition
}

import { HttpVerb, HttpVerbs } from './http-verbs'
import { invariant } from './invariant'
import {
  addRoute,
  addBeforeMiddleware,
  addAfterMiddleware,
  addHttpVerbs,
  MiddlewareParameter,
  updateState,
} from './state-util'

/**
 * Registers a path for this class method.
 * You can add more than one.
 *
 * @param path
 */
export function route(path: string) {
  return function routerDecorator(target: any, name: string | null = null) {
    updateState(target, (state) => addRoute(state, name, path))
  }
}

/**
 * Adds one or more middleware before the method middleware.
 * Can be applied to classes and methods. Class-level `before` middleware
 * runs before method-level ones.
 *
 * @param middleware
 */
export function before(middleware: MiddlewareParameter) {
  return function routerDecorator(target: any, name: string | null = null) {
    updateState(target, (state) => addBeforeMiddleware(state, name, middleware))
  }
}

/**
 * Adds one or more middleware after the method middleware.
 * Can be applied to classes and methods. Class-level `after` middleware
 * runs after method-level ones.
 *
 * @param middleware
 */
export function after(middleware: MiddlewareParameter) {
  return function routerDecorator(target: any, name: string | null = null) {
    updateState(target, (state) => addAfterMiddleware(state, name, middleware))
  }
}

/**
 * Assigns one or more HTTP verbs to class method.
 *
 * @param httpVerbs
 */
export function verbs(httpVerbs: Array<HttpVerb>) {
  return function verbsDecorator(target: any, name: string | null = null) {
    invariant(name, 'The "verbs" decorator can only be used on class verbs.')
    updateState(target, (state) => addHttpVerbs(state, name, httpVerbs))
  }
}

/**
 * The same as `verbs([HttpVerbs.GET])`
 */
export const GET = () => verbs([HttpVerbs.GET])

/**
 * The same as `verbs([HttpVerbs.HEAD])`
 */
export const HEAD = () => verbs([HttpVerbs.HEAD])

/**
 * The same as `verbs([HttpVerbs.POST])`
 */
export const POST = () => verbs([HttpVerbs.POST])

/**
 * The same as `verbs([HttpVerbs.PUT])`
 */
export const PUT = () => verbs([HttpVerbs.PUT])

/**
 * The same as `verbs([HttpVerbs.DELETE])`
 */
export const DELETE = () => verbs([HttpVerbs.DELETE])

/**
 * The same as `verbs([HttpVerbs.CONNECT])`
 */
export const CONNECT = () => verbs([HttpVerbs.CONNECT])

/**
 * The same as `verbs([HttpVerbs.OPTIONS])`
 */
export const OPTIONS = () => verbs([HttpVerbs.OPTIONS])

/**
 * The same as `verbs([HttpVerbs.PATCH])`
 */
export const PATCH = () => verbs([HttpVerbs.PATCH])

/**
 * The same as `verbs([HttpVerbs.ALL])`
 */
export const ALL = () => verbs([HttpVerbs.ALL])

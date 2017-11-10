import { HttpMethod, HttpMethods } from './http-methods'
import { invariant } from './invariant'
import {
  getOrInitConfigForDecorator,
  addRoute,
  addBeforeMiddleware,
  addAfterMiddleware,
  addMethods,
  MiddlewareParameter
} from './state-util'

/**
 * Registers a path for this class method.
 * You can add more than one.
 *
 * @param path
 */
export function route(path: string) {
  return function routerDecorator(
    target: any,
    name?: string,
    descriptor?: PropertyDescriptor
  ) {
    addRoute(getOrInitConfigForDecorator(target, name), path)
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
  return function routerDecorator(
    target: any,
    name?: string,
    descriptor?: PropertyDescriptor
  ) {
    addBeforeMiddleware(getOrInitConfigForDecorator(target, name), middleware)
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
  return function routerDecorator(
    target: any,
    name?: string,
    descriptor?: PropertyDescriptor
  ) {
    addAfterMiddleware(getOrInitConfigForDecorator(target, name), middleware)
  }
}

/**
 * Assigns one or more HTTP methods to class method.
 *
 * @param httpMethods
 */
export function methods(httpMethods: Array<HttpMethod>) {
  return function methodsDecorator(target: any, name?: string) {
    invariant(
      name,
      'The "methods" decorator can only be used on class methods.'
    )
    addMethods(getOrInitConfigForDecorator(target, name), httpMethods)
  }
}

/**
 * The same as `methods([HttpMethods.GET])`
 */
export const GET = () => methods([HttpMethods.GET])

/**
 * The same as `methods([HttpMethods.HEAD])`
 */
export const HEAD = () => methods([HttpMethods.HEAD])

/**
 * The same as `methods([HttpMethods.POST])`
 */
export const POST = () => methods([HttpMethods.POST])

/**
 * The same as `methods([HttpMethods.PUT])`
 */
export const PUT = () => methods([HttpMethods.PUT])

/**
 * The same as `methods([HttpMethods.DELETE])`
 */
export const DELETE = () => methods([HttpMethods.DELETE])

/**
 * The same as `methods([HttpMethods.CONNECT])`
 */
export const CONNECT = () => methods([HttpMethods.CONNECT])

/**
 * The same as `methods([HttpMethods.OPTIONS])`
 */
export const OPTIONS = () => methods([HttpMethods.OPTIONS])

/**
 * The same as `methods([HttpMethods.PATCH])`
 */
export const PATCH = () => methods([HttpMethods.PATCH])

/**
 * The same as `methods([HttpMethods.ALL])`
 */
export const ALL = () => methods([HttpMethods.ALL])

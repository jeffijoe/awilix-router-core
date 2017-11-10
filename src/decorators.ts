import { HttpMethod, HttpMethods } from './http-methods'
import { invariant } from './invariant'
import { uniq } from './util'
import { getOrInitConfigForDecorator, IRouteConfig } from './state-util'

export type MiddlewareParameter = Array<any> | any

export function route(path: string) {
  return function routerDecorator(
    target: any,
    name?: string,
    descriptor?: PropertyDescriptor
  ) {
    const config = getOrInitConfigForDecorator(target, name)
    config.paths = uniq([...config.paths, path])
  }
}

export function before(middleware: MiddlewareParameter) {
  return function routerDecorator(
    target: any,
    name?: string,
    descriptor?: PropertyDescriptor
  ) {
    const config = getOrInitConfigForDecorator(target, name)
    addMiddleware(config.beforeMiddleware, middleware)
  }
}

export function after(middleware: MiddlewareParameter) {
  return function routerDecorator(
    target: any,
    name?: string,
    descriptor?: PropertyDescriptor
  ) {
    const config = getOrInitConfigForDecorator(target, name)
    addMiddleware(config.afterMiddleware, middleware)
  }
}

export function methods(httpMethods: Array<HttpMethod>, route?: string) {
  return function methodsDecorator(target: any, name?: string) {
    invariant(
      name,
      'The "methods" decorator can only be used on class methods.'
    )
    addMethods(getOrInitConfigForDecorator(target, name), httpMethods)
  }
}

export const GET = () => methods([HttpMethods.GET])

export const HEAD = () => methods([HttpMethods.HEAD])

export const POST = () => methods([HttpMethods.POST])

export const PUT = () => methods([HttpMethods.PUT])

export const DELETE = () => methods([HttpMethods.DELETE])

export const CONNECT = () => methods([HttpMethods.CONNECT])

export const OPTIONS = () => methods([HttpMethods.OPTIONS])

export const PATCH = () => methods([HttpMethods.PATCH])

export const ALL = () => methods([HttpMethods.ALL])

function addMiddleware(targetArray: Array<any>, value: MiddlewareParameter) {
  Array.isArray(value) ? targetArray.push(...value) : targetArray.push(value)
}

function addMethods(config: IRouteConfig, value: Array<HttpMethod>) {
  config.methods = uniq([...config.methods, ...value])
}

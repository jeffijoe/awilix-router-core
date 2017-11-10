import { HttpMethod } from './http-methods'
import { uniq } from './util'

/**
 * Middleware decorator parameter.
 */
export type MiddlewareParameter = Array<any> | any

/**
 * Symbol used for getting and setting the config state.
 */
const STATE = Symbol('Router Config')

/**
 * Router config state.
 */
export interface IRouterConfigState {
  /**
   * Root config (class-level).
   */
  root: IRouteConfig
  /**
   * Method configs (method-level).
   */
  methods: Map<string, IRouteConfig>
}

/**
 * A specific route config.
 */
export interface IRouteConfig {
  /**
   * Paths to register.
   */
  paths: Array<string>
  /**
   * Middleware to run before the method.
   */
  beforeMiddleware: Array<any>
  /**
   * Middleware to run after the method.
   */
  afterMiddleware: Array<any>
  /**
   * HTTP methods to register.
   */
  methods: Array<HttpMethod>
}

/**
 * Gets or initializes a method config.
 *
 * @param state
 * @param name
 */
export function getOrInitMethodConfig(state: IRouterConfigState, name: string) {
  const config = state.methods.get(name)
  if (!config) {
    const newConfig = createRouteConfig()
    state.methods.set(name, newConfig)
    return newConfig
  }

  return config
}

/**
 * Gets the config state from the target.
 *
 * @param target
 */
export function getState(target: any): IRouterConfigState | null {
  return (target.prototype ? target.prototype[STATE] : target[STATE]) || null
}

/**
 * Sets the config state on the target.
 * @param target
 * @param state
 */
export function setState(target: any, state: IRouterConfigState) {
  if (target.prototype) {
    target.prototype[STATE] = state
  } else {
    target[STATE] = state
  }
  return state
}

/**
 * Gets or initializes the configuration for a decorator.
 * If it's a method decorator, we initialize and return one of those,
 * else we return the root config.
 *
 * @param target
 * @param name
 */
export function getOrInitConfigForDecorator(target: any, name?: string) {
  const state = getState(target) || setState(target, createState())
  const config = name ? getOrInitMethodConfig(state, name) : state.root
  return config
}

/**
 * Creates a new state object.
 */
export function createState(): IRouterConfigState {
  const state: IRouterConfigState = {
    root: createRouteConfig(),
    methods: new Map<string, IRouteConfig>()
  }
  return state
}

/**
 * Creates a new route config object.
 */
export function createRouteConfig(): IRouteConfig {
  return {
    paths: [],
    beforeMiddleware: [],
    afterMiddleware: [],
    methods: []
  }
}

/**
 * Rolls up state so paths are joined, middleware rolled into
 * the correct order, etc.
 *
 * @param state
 */
export function rollUpState(
  state: IRouterConfigState
): Map<string, IRouteConfig> {
  const result = new Map<string, IRouteConfig>()
  state.methods.forEach((method, key) => {
    result.set(key, {
      paths: concatPaths(state.root.paths, method.paths),
      beforeMiddleware: [
        ...state.root.beforeMiddleware,
        ...method.beforeMiddleware
      ],
      afterMiddleware: [
        ...method.afterMiddleware,
        ...state.root.afterMiddleware
      ],
      methods: method.methods
    })
  })
  return result
}

/**
 * Adds a route to the config.
 *
 * @param config
 * @param path
 */
export function addRoute(config: IRouteConfig, path: string) {
  config.paths = uniq([...config.paths, path])
  return config
}

/**
 * Adds middleware that runs before the method on the specified config.
 *
 * @param config
 * @param middleware
 */
export function addBeforeMiddleware(
  config: IRouteConfig,
  middleware: MiddlewareParameter
) {
  addMiddleware(config.beforeMiddleware, middleware)
  return config
}

/**
 * Adds middleware that runs after the method on the specified config.
 *
 * @param config
 * @param middleware
 */
export function addAfterMiddleware(
  config: IRouteConfig,
  middleware: MiddlewareParameter
) {
  addMiddleware(config.afterMiddleware, middleware)
  return config
}

/**
 * Adds methods to the specified route config, and depupes the resulting array.
 *
 * @param config
 * @param value
 */
export function addMethods(config: IRouteConfig, value: Array<HttpMethod>) {
  config.methods = uniq([...config.methods, ...value])
}

/**
 * Adds a middleware to the end of the target array.
 *
 * @param targetArray
 * @param value
 */
function addMiddleware(targetArray: Array<any>, value: MiddlewareParameter) {
  Array.isArray(value) ? targetArray.push(...value) : targetArray.push(value)
}

/**
 * Concatenates root and method paths so we have one for each combination.
 */
function concatPaths(rootPaths: Array<string>, methodPaths: Array<string>) {
  const result: Array<string> = []
  if (rootPaths.length === 0) {
    return [...methodPaths]
  }

  rootPaths.forEach(rootPath => {
    methodPaths.forEach(methodPath => {
      result.push(rootPath + methodPath)
    })
  })

  return result
}

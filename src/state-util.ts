import { HttpVerb } from './http-verbs'
import { uniq } from './util'
import { STATE, IS_CONTROLLER_BUILDER } from './symbols'
import { IAwilixControllerBuilder } from './controller'

/**
 * Middleware decorator parameter.
 */
export type MiddlewareParameter = Array<any> | any

/**
 * Function that returns T.
 */
export type FunctionReturning<T = any> = (...args: Array<any>) => T

/**
 * A class or function returning T.
 */
export type ClassOrFunctionReturning<T = any> =
  | FunctionReturning<T>
  | Constructor<T>

/**
 * A class constructor. For example:
 *
 *    class MyClass {}
 *
 *    MyClass
 *    ^^^^^^^
 */
export type Constructor<T = any> = { new (...args: any[]): T }

/**
 * Target to instantiate and it's router state.
 */
export interface IStateAndTarget {
  /**
   * The target to call.
   */
  target: Constructor | Function
  /**
   * Routing state to configure.
   */
  state: IRouterConfigState
}

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
  methods: Map<MethodName, IRouteConfig>
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
   * HTTP verbs to register.
   */
  verbs: Array<HttpVerb>
}

/**
 * Method name type.
 */
export type MethodName = string | number | symbol | null

/**
 * Rolls up state so paths are joined, middleware rolled into
 * the correct order, etc.
 *
 * @param state
 */
export function rollUpState(
  state: IRouterConfigState
): Map<MethodName, IRouteConfig> {
  const result = new Map<MethodName, IRouteConfig>()
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
      verbs: method.verbs
    })
  })
  return result
}

/**
 * Given a decorated class or a controller builder, returns a normalized
 * target + state object. For example, if using the controller builder,
 * we need to use the `target` property. If using decorators, the required
 * value *is* the target.
 *
 * @param src
 * @returns The normalized target + state, or `null` if not applicable.
 */
export function getStateAndTarget(src: any): IStateAndTarget | null {
  const state = getState(src)
  if (!state) {
    return null
  }

  const target = src[IS_CONTROLLER_BUILDER]
    ? (src as IAwilixControllerBuilder).target
    : src

  return { target, state }
}

/**
 * Adds a route to the state.
 *
 * @param state
 * @param methodName
 * @param path
 */
export function addRoute(
  state: IRouterConfigState,
  methodName: MethodName,
  path: string
) {
  const config = getOrCreateConfig(state, methodName)
  return updateConfig(state, methodName, {
    paths: uniq([...config.paths, path])
  })
}

/**
 * Adds middleware that runs before the method on the specified config.
 *
 * @param state
 * @param methodName
 * @param middleware
 */
export function addBeforeMiddleware(
  state: IRouterConfigState,
  methodName: MethodName,
  middleware: MiddlewareParameter
) {
  const config = getOrCreateConfig(state, methodName)
  return updateConfig(state, methodName, {
    beforeMiddleware: addMiddleware(config.beforeMiddleware, middleware)
  })
}

/**
 * Adds middleware that runs after the method on the specified config.
 *
 * @param state
 * @param methodName
 * @param middleware
 */
export function addAfterMiddleware(
  state: IRouterConfigState,
  methodName: MethodName,
  middleware: MiddlewareParameter
) {
  const config = getOrCreateConfig(state, methodName)
  return updateConfig(state, methodName, {
    afterMiddleware: addMiddleware(config.afterMiddleware, middleware)
  })
}

/**
 * Adds middleware that runs after the method on the specified config.
 *
 * @param state
 * @param methodName
 * @param value
 */
export function addHttpVerbs(
  state: IRouterConfigState,
  methodName: MethodName,
  value: Array<HttpVerb>
) {
  const config = getOrCreateConfig(state, methodName)
  return updateConfig(state, methodName, {
    verbs: uniq([...config.verbs, ...value])
  })
}

/**
 * Gets or creates a method config.
 *
 * @param state
 * @param methodName
 */
export function getOrCreateConfig(
  state: IRouterConfigState,
  methodName: MethodName
) {
  const config =
    methodName === null ? state.root : state.methods.get(methodName)

  if (!config) {
    return createRouteConfig()
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
 *
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
 * Updates the state on the specified target by invoking the callback with the previous state.
 *
 * @param target
 * @param updater
 */
export function updateState(
  target: any,
  updater: (state: IRouterConfigState) => IRouterConfigState
) {
  setState(target, updater(getOrInitStateForDecoratorTarget(target)))
}

/**
 * Gets or initializes the state for a decorated target
 *
 * @param target
 * @param name
 */
export function getOrInitStateForDecoratorTarget(target: any) {
  return getState(target) || createState()
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
 * Updates a config on a state, returns the new state.
 *
 * @param state
 * Existing state.
 *
 * @param methodName
 * If null, updates the root config. Else, the method config.
 *
 * @param newConfig
 * Config to shallow-merge in.
 */
export function updateConfig(
  state: IRouterConfigState,
  methodName: MethodName,
  newConfig: Partial<IRouteConfig>
): IRouterConfigState {
  const existing = getOrCreateConfig(state, methodName)
  const mergedConfig: IRouteConfig = {
    ...existing,
    ...newConfig
  }

  // Root update is simple.
  if (methodName === null) {
    return {
      ...state,
      root: mergedConfig
    }
  }

  // Filters out the entry we're replacing.
  const filteredEntries = Array.from(state.methods.entries()).filter(
    ([key]) => key !== methodName
  )

  return {
    ...state,
    methods: new Map([...filteredEntries, [methodName, mergedConfig]])
  }
}

/**
 * Creates a new route config object.
 */
export function createRouteConfig(): IRouteConfig {
  return {
    paths: [],
    beforeMiddleware: [],
    afterMiddleware: [],
    verbs: []
  }
}

/**
 * Adds a middleware to the end of the target array.
 *
 * @param targetArray
 * @param value
 */
function addMiddleware(targetArray: Array<any>, value: MiddlewareParameter) {
  return Array.isArray(value)
    ? [...targetArray, ...value]
    : [...targetArray, value]
}

/**
 * Concatenates root and method paths so we have one for each combination.
 */
function concatPaths(rootPaths: Array<string>, methodPaths: Array<string>) {
  if (rootPaths.length === 0) {
    return [...methodPaths]
  }

  const result: Array<string> = []
  rootPaths.forEach(rootPath => {
    if (methodPaths.length === 0) {
      result.push(rootPath)
    } else {
      methodPaths.forEach(methodPath => {
        result.push(rootPath + methodPath)
      })
    }
  })

  return result
}

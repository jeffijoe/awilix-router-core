import { HttpMethod } from './http-methods'

const STATE = Symbol('Router Config')

export interface IRouterConfigState {
  root: IRouteConfig
  methods: Map<string, IRouteConfig>
}

export interface IRouteConfig {
  paths: Array<string>
  beforeMiddleware: Array<any>
  afterMiddleware: Array<any>
  methods: Array<HttpMethod>
}

export function getOrInitMethodConfig(state: IRouterConfigState, name: string) {
  const config = state.methods.get(name)
  if (!config) {
    const newConfig = createRouteConfig()
    state.methods.set(name, newConfig)
    return newConfig
  }

  return config
}

export function getState(target: any): IRouterConfigState | null {
  return (target.prototype ? target.prototype[STATE] : target[STATE]) || null
}

export function setState(target: any, state: IRouterConfigState) {
  if (target.prototype) {
    target.prototype[STATE] = state
  } else {
    target[STATE] = state
  }
  return state
}

export function getOrInitConfigForDecorator(target: any, name?: string) {
  const state = getState(target) || setState(target, createState())
  const config = name ? getOrInitMethodConfig(state, name) : state.root
  return config
}

export function createState(): IRouterConfigState {
  const state: IRouterConfigState = {
    root: createRouteConfig(),
    methods: new Map<string, IRouteConfig>()
  }
  return state
}

export function createRouteConfig(): IRouteConfig {
  return {
    paths: [],
    beforeMiddleware: [],
    afterMiddleware: [],
    methods: []
  }
}

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

function concatPaths(rootPaths: Array<string>, methodPaths: Array<string>) {
  const result: Array<string> = []
  rootPaths.forEach(rootPath => {
    methodPaths.forEach(methodPath => {
      result.push(rootPath + methodPath)
    })
  })

  return result
}

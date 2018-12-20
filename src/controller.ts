import {
  MiddlewareParameter,
  createState,
  addHttpVerbs,
  addRoute,
  addBeforeMiddleware,
  Constructor,
  IRouterConfigState,
  addAfterMiddleware,
  ClassOrFunctionReturning
} from './state-util'
import { HttpVerbs, HttpVerb } from './http-verbs'
import { STATE, IS_CONTROLLER_BUILDER } from './symbols'

/**
 * Method builder options.
 */
export interface IMethodBuilderOpts {
  before?: MiddlewareParameter
  after?: MiddlewareParameter
}

/**
 * Verb builder function.
 */
export type VerbBuilderFunction<T = any> = (
  path: string,
  method: keyof T,
  opts?: IMethodBuilderOpts
) => IAwilixControllerBuilder<T>

/**
 * Fluid router builder.
 */
export interface IAwilixControllerBuilder<T = any> {
  [STATE]: IRouterConfigState
  [IS_CONTROLLER_BUILDER]: boolean
  target: Constructor | Function
  get: VerbBuilderFunction<T>
  post: VerbBuilderFunction<T>
  put: VerbBuilderFunction<T>
  patch: VerbBuilderFunction<T>
  delete: VerbBuilderFunction<T>
  head: VerbBuilderFunction<T>
  options: VerbBuilderFunction<T>
  connect: VerbBuilderFunction<T>
  all: VerbBuilderFunction<T>
  verbs(
    verbs: Array<HttpVerb>,
    path: string,
    method: keyof T,
    opts?: IMethodBuilderOpts
  ): this
  prefix(path: string): this
  before(value: MiddlewareParameter): this
  after(value: MiddlewareParameter): this
}

/**
 * Configures routing config for a class or function to be invoked by a router.
 *
 * @example
 *   const api = ({ todoService }) => ({
 *     find: (ctx) => { ... }
 *   })
 *
 *   export default createController(api)
 *     .prefix('/todos')
 *     .before(bodyParser())
 *     .get('/', 'find')
 *     .get('/:id', 'get')
 *     .post('/:id', 'create', {
 *       before: [authenticate()],
 *     })
 *     .patch('/:id', 'update', {
 *       before: [authenticate()]
 *     })
 */
export function createController<T = any>(
  ClassOrFunction: ClassOrFunctionReturning<T>
): IAwilixControllerBuilder<T> {
  return createControllerFromState(ClassOrFunction, createState())
}

/**
 * Creates a builder from existing state.
 * This is used internally, but exported for convenience.
 *
 * @param ClassOrFunction The target to invoke.
 * @param state Existing state to continue building on.
 */
export function createControllerFromState(
  ClassOrFunction: Constructor | Function,
  state: IRouterConfigState
) {
  const builder: IAwilixControllerBuilder = {
    [STATE]: state,
    [IS_CONTROLLER_BUILDER]: true,
    target: ClassOrFunction,
    get: createVerbFunction(HttpVerbs.GET),
    post: createVerbFunction(HttpVerbs.POST),
    put: createVerbFunction(HttpVerbs.PUT),
    patch: createVerbFunction(HttpVerbs.PATCH),
    delete: createVerbFunction(HttpVerbs.DELETE),
    head: createVerbFunction(HttpVerbs.HEAD),
    options: createVerbFunction(HttpVerbs.OPTIONS),
    connect: createVerbFunction(HttpVerbs.CONNECT),
    all: createVerbFunction(HttpVerbs.ALL),
    prefix(path) {
      return createControllerFromState(
        ClassOrFunction,
        addRoute(state, null, path)
      )
    },
    before(middleware) {
      return createControllerFromState(
        ClassOrFunction,
        addBeforeMiddleware(state, null, middleware)
      )
    },
    after(middleware) {
      return createControllerFromState(
        ClassOrFunction,
        addAfterMiddleware(state, null, middleware)
      )
    },
    verbs(verbs, path, method, opts) {
      state = addRoute(state, method, path)
      state = addHttpVerbs(state, method, verbs)
      if (opts) {
        if (opts.before) {
          state = addBeforeMiddleware(state, method, opts.before)
        }

        if (opts.after) {
          state = addAfterMiddleware(state, method, opts.after)
        }
      }

      return createControllerFromState(ClassOrFunction, state)
    }
  }

  return builder

  /**
   * Creates a preconfigured verb function.
   *
   * @param verb
   */
  function createVerbFunction(verb: HttpVerb): VerbBuilderFunction {
    return function configureRoute(path, method, opts) {
      return builder.verbs([verb], path, method, opts)
    }
  }
}

import {
  MiddlewareParameter,
  createState,
  addHttpVerbs,
  getOrInitMethodConfig,
  addRoute,
  addBeforeMiddleware,
  addAfterMiddleware
} from './state-util'
import { HttpVerbs } from './http-verbs'
import { HttpVerb, Constructor } from 'src'
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
export type VerbBuilderFunction = (
  path: string,
  method: string,
  opts?: IMethodBuilderOpts
) => IAwilixControllerBuilder

/**
 * Fluid router builder.
 */
export interface IAwilixControllerBuilder {
  target: Constructor | Function
  get: VerbBuilderFunction
  post: VerbBuilderFunction
  put: VerbBuilderFunction
  patch: VerbBuilderFunction
  delete: VerbBuilderFunction
  head: VerbBuilderFunction
  options: VerbBuilderFunction
  connect: VerbBuilderFunction
  all: VerbBuilderFunction
  verbs(
    verbs: Array<HttpVerb>,
    path: string,
    method: string,
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
export function createController(
  ClassOrFunction: Constructor | Function
): IAwilixControllerBuilder {
  const state = createState()
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
      addRoute(state.root, path)
      return builder
    },
    before(middleware) {
      addBeforeMiddleware(state.root, middleware)
      return builder
    },
    after(middleware) {
      addAfterMiddleware(state.root, middleware)
      return builder
    },
    verbs(verbs, path, method, opts) {
      const methodConfig = getOrInitMethodConfig(state, method)
      addRoute(methodConfig, path)
      addHttpVerbs(methodConfig, verbs)
      if (opts) {
        if (opts.before) {
          addBeforeMiddleware(methodConfig, opts.before)
        }

        if (opts.after) {
          addAfterMiddleware(methodConfig, opts.after)
        }
      }
      return builder
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

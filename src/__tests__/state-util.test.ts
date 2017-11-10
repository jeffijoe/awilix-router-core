import { rollUpState, getState, getStateAndTarget } from '../state-util'
import { route, before, after, GET, POST } from '../decorators'
import { HttpVerbs } from '../http-verbs'
import { createController } from '../controller'

describe('rollUpState', () => {
  it('rolls up config correctly', () => {
    @route('/root2')
    @route('/root1')
    @before('beforeRoot2')
    @before('beforeRoot1')
    @after('afterRoot2')
    @after('afterRoot1')
    class Test {
      @route('/m1-2')
      @route('/m1-1')
      @before('beforem1')
      @after('afterm1')
      @GET()
      @POST()
      m1() {
        /**/
      }
    }

    const result = rollUpState(getState(Test)!)
    expect(Array.from(result.keys())).toEqual(['m1'])
    const m1 = result.get('m1')!
    expect(m1.paths).toEqual([
      '/root1/m1-1',
      '/root1/m1-2',
      '/root2/m1-1',
      '/root2/m1-2'
    ])
    expect(m1.beforeMiddleware).toEqual([
      'beforeRoot1',
      'beforeRoot2',
      'beforem1'
    ])
    expect(m1.afterMiddleware).toEqual(['afterm1', 'afterRoot1', 'afterRoot2'])
    expect(m1.verbs).toEqual([HttpVerbs.POST, HttpVerbs.GET])
  })

  it('returns child paths as-is when there are no root paths', () => {
    class Test {
      @route('/test1')
      @route('/test2')
      method() {
        /**/
      }
    }

    const result = rollUpState(getState(Test)!)
    expect(result.get('method')!.paths).toEqual(['/test2', '/test1'])
  })

  it('does not require a method route when there is a root route', () => {
    @route('/root')
    class Test {
      @GET()
      get() {
        /**/
      }

      @POST()
      post() {
        /**/
      }
    }

    const result = rollUpState(getState(Test)!)
    expect(result.get('get')!.paths).toEqual(['/root'])
    expect(result.get('post')!.paths).toEqual(['/root'])
  })
})

describe('getStateAndTarget', () => {
  it('returns the correct state and target for decorated classes', () => {
    @route('/test')
    class Test {
      @GET()
      method() {
        /**/
      }
    }

    const { target, state } = getStateAndTarget(Test)!
    expect(target).toBe(Test)
    expect(state.methods.get('method')!.verbs).toContain(HttpVerbs.GET)
  })

  it('returns the correct state and target for controller builders', () => {
    class Test {
      method() {
        /**/
      }
    }

    const controller = createController(Test).get('/', 'method')
    const { target, state } = getStateAndTarget(controller)!
    expect(target).toBe(Test)
    expect(state.methods.get('method')!.verbs).toContain(HttpVerbs.GET)
  })
})

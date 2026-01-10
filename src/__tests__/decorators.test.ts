import {
  route,
  before,
  after,
  verbs,
  GET,
  PATCH,
  HEAD,
  OPTIONS,
  CONNECT,
  PUT,
  POST,
  DELETE,
  ALL,
} from '../decorators'
import { HttpVerbs } from '../http-verbs'
import { getState } from '../state-util'

describe('router decorator', () => {
  describe('on class', () => {
    it('sets the path on the root config', () => {
      @route('/test')
      class Test {}

      const state = getState(Test)!
      expect(state.root.paths).toEqual(['/test'])
    })
  })

  describe('on method', () => {
    it('sets the path on the method config', () => {
      class Test {
        // Note: decorators run right-to-left.
        @route('/overriden')
        @route('/test')
        wee() {
          /**/
        }
      }

      const config = getState(Test)!.methods.get('wee')!
      expect(config.paths).toEqual(['/test', '/overriden'])
    })
  })
})

describe('before and after middleware', () => {
  @before(['rootBefore3', 'rootBefore4'])
  @before(['rootBefore1', 'rootBefore2'])
  @after('rootAfter2')
  @after('rootAfter1')
  class Test {
    @before(['m1Before1', 'm1Before2'])
    @after(['m1After1', 'm1After2'])
    m1() {
      /**/
    }
    @before(['m2Before1', 'm2Before2'])
    @after(['m2After1', 'm2After2'])
    m2() {
      /**/
    }
  }

  const state = getState(Test)!

  describe('on class', () => {
    it('sets the middlewares on the root', () => {
      expect(state.root.beforeMiddleware).toEqual([
        'rootBefore1',
        'rootBefore2',
        'rootBefore3',
        'rootBefore4',
      ])

      expect(state.root.afterMiddleware).toEqual(['rootAfter1', 'rootAfter2'])
    })
  })

  describe('on method', () => {
    it('sets the middlewares on the methods', () => {
      const m1 = state.methods.get('m1')!
      const m2 = state.methods.get('m2')!
      expect(m1.beforeMiddleware).toEqual(['m1Before1', 'm1Before2'])
      expect(m2.beforeMiddleware).toEqual(['m2Before1', 'm2Before2'])
      expect(m1.afterMiddleware).toEqual(['m1After1', 'm1After2'])
      expect(m2.afterMiddleware).toEqual(['m2After1', 'm2After2'])
    })
  })
})

describe('methods decorator', () => {
  describe('on class', () => {
    it('is not allowed', () => {
      expect(() => {
        @verbs([HttpVerbs.GET])
        class Test {}
        return new Test()
      }).toThrow(/verbs/)
      expect(() => {
        @GET()
        class Test {}
        return new Test()
      }).toThrow(/verbs/)
    })
  })

  describe('on methods', () => {
    it('adds the http method', () => {
      class Test {
        @route('/save')
        @POST()
        @PUT()
        @PATCH()
        @HEAD()
        @GET()
        @DELETE()
        @OPTIONS()
        @CONNECT()
        @DELETE()
        @ALL()
        wee() {
          /**/
        }
      }

      const state = getState(Test)!
      const wee = state.methods.get('wee')!
      expect(wee.verbs).toEqual([
        HttpVerbs.ALL,
        HttpVerbs.DELETE,
        HttpVerbs.CONNECT,
        HttpVerbs.OPTIONS,
        HttpVerbs.GET,
        HttpVerbs.HEAD,
        HttpVerbs.PATCH,
        HttpVerbs.PUT,
        HttpVerbs.POST,
      ])
      expect(wee.paths).toEqual(['/save'])
    })
  })
})

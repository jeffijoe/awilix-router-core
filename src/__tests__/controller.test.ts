import { createController } from '../controller'
import { getState, rollUpState } from '../state-util'

describe('createController', () => {
  it('creates the correct state', () => {
    const target = () => {
      const noop = () => undefined
      return { all: noop, get: noop, post: noop, put: noop }
    }
    const router = createController(target)
      .prefix('/root1')
      .prefix('/root2')
      .before('beforeRoot1')
      .before('beforeRoot2')
      .after('afterRoot1')
      .after('afterRoot2')
      .all('/all', 'all', { before: ['beforeAll'] })
      .get('/get', 'get', { before: ['beforeGet'], after: 'afterGet' })
      .post('/post', 'post')
      .put('/', 'put', {})
    const state = rollUpState(getState(router)!)
    expect(state).toMatchSnapshot()
  })
})

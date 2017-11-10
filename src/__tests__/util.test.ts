import { uniq } from '../util'

describe('uniq', () => {
  it('returns unique items', () => {
    expect(uniq([1, 2, 3, 2, 4])).toEqual([1, 2, 3, 4])
  })
})

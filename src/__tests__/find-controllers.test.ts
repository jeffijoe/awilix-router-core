import { findControllers } from '../find-controllers'

describe('findControllers', () => {
  it('returns the classes from the fixtures', () => {
    const result = findControllers('__fixtures__/*.js', { absolute: true })
    const moduleExports = result.find((x: any) => x.target.isModuleExports)
    const defaultExports = result.find((x: any) => x.target.isDefaultExport)
    expect(result.length).toBe(2)
    expect(typeof (moduleExports as any).target).toBe('function')
    expect(typeof (defaultExports as any).target).toBe('function')
  })
})

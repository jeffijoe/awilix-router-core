import { findClasses } from '../find-classes'

describe('findClasses', () => {
  it('returns the classes from the fixtures', () => {
    const result = findClasses('__fixtures__/*.js', { absolute: true })
    const moduleExports = result.find((x: any) => x.isModuleExports)
    const defaultExports = result.find((x: any) => x.isDefaultExport)
    expect(result.length).toBe(2)
    expect(typeof moduleExports).toBe('function')
    expect(typeof defaultExports).toBe('function')
  })
})

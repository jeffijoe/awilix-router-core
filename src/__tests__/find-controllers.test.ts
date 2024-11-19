import { FindControllersResult, findControllers } from '../find-controllers'

describe('findControllers', () => {
  it('(sync) returns the classes from the fixtures', () => {
    const result = findControllers('__fixtures__/*.js', {
      absolute: true,
    })

    const moduleExports = result.find((x: any) => x.target.isModuleExports)
    const defaultExports = result.find((x: any) => x.target.isDefaultExport)
    const namedExports = result.find((x: any) => x.target.isNamedExport)
    const mixedDefaultExports = result.find(
      (x: any) => x.target.isMixedDefaultExport,
    )
    const mixedNamedExports = result.find(
      (x: any) => x.target.isMixedNamedExport,
    )
    const mixedModuleExports = result.find(
      (x: any) => x.target.isMixedModuleExports,
    )
    const mixedModuleDefaultExports = result.find(
      (x: any) => x.target.isMixedModuleDefaultExport,
    )
    const mixedModuleNamedExports = result.find(
      (x: any) => x.target.isMixedModuleNamedExport,
    )
    expect(result.length).toBe(6)
    expect(typeof (moduleExports as any).target).toBe('function')
    expect(typeof (defaultExports as any).target).toBe('function')
    expect(typeof (namedExports as any).target).toBe('function')
    expect(typeof (mixedDefaultExports as any).target).toBe('function')
    expect(typeof (mixedNamedExports as any).target).toBe('function')
    expect(typeof (mixedModuleExports as any).target).toBe('function')
    expect(mixedModuleDefaultExports).toBeUndefined()
    expect(mixedModuleNamedExports).toBeUndefined()
  })

  it('(async) returns the classes from the fixtures', async () => {
    const result = await findControllers('__fixtures__/*.js', {
      absolute: true,
      esModules: true,
    })

    const moduleExports = result.find((x: any) => x.target.isModuleExports)
    const defaultExports = result.find((x: any) => x.target.isDefaultExport)
    const namedExports = result.find((x: any) => x.target.isNamedExport)
    const mixedDefaultExports = result.find(
      (x: any) => x.target.isMixedDefaultExport,
    )
    const mixedNamedExports = result.find(
      (x: any) => x.target.isMixedNamedExport,
    )
    const mixedModuleExports = result.find(
      (x: any) => x.target.isMixedModuleExports,
    )
    const mixedModuleDefaultExports = result.find(
      (x: any) => x.target.isMixedModuleDefaultExport,
    )
    const mixedModuleNamedExports = result.find(
      (x: any) => x.target.isMixedModuleNamedExport,
    )
    expect(result.length).toBe(5)
    expect(typeof (moduleExports as any).target).toBe('function')
    expect(typeof (namedExports as any).target).toBe('function')
    expect(typeof (mixedNamedExports as any).target).toBe('function')
    expect(typeof (mixedModuleExports as any).target).toBe('function')
    expect(typeof (mixedModuleNamedExports as any).target).toBe('function')
    expect(defaultExports).toBeUndefined()
    expect(mixedModuleDefaultExports).toBeUndefined()
    expect(mixedDefaultExports).toBeUndefined()
  })
})

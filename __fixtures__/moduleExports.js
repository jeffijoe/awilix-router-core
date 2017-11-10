const { createController } = require('../src/controller')

class ModuleExportsClass {}
ModuleExportsClass.isModuleExports = true
module.exports = createController(ModuleExportsClass)

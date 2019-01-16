const { createController } = require('../src/controller')

class MixedModuleExportsClass {}
MixedModuleExportsClass.isMixedModuleExports = true
module.exports = createController(MixedModuleExportsClass)

class MixedModuleDefaultExportClass {}
MixedModuleDefaultExportClass.isMixedModuleDefaultExport = true
module.exports.default = createController(MixedModuleDefaultExportClass)

class MixedModuleNamedExportClass {}
MixedModuleNamedExportClass.isMixedModuleNamedExport = true
module.exports.MixedModuleNamedExportClass = createController(MixedModuleNamedExportClass)

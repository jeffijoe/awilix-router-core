const { createController } = require('../src/controller')

class MixedDefaultExportClass {}
MixedDefaultExportClass.isMixedDefaultExport = true
module.exports.default = createController(MixedDefaultExportClass)

class MixedNamedExportClass {}
MixedNamedExportClass.isMixedNamedExport = true
module.exports.MixedNamedExportClass = createController(MixedNamedExportClass)

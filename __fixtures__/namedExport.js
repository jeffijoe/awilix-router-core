const { createController } = require('../src/controller')

class NamedExportClass {}
NamedExportClass.isNamedExport = true
module.exports.NamedExportClass = createController(NamedExportClass)

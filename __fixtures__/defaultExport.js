const { createController } = require('../src/controller')

class DefaultExportClass {}
DefaultExportClass.isDefaultExport = true
module.exports.default = createController(DefaultExportClass)

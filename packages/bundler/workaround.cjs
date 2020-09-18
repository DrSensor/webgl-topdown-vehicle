const { resolve, join } = require('path')

exports.loadPkg = path => require(join(resolve('.'), path))

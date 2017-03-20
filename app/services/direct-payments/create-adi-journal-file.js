const python = require('python-shell')
const log = require('../log')
const config = require('../../../config')

function execute (totalPayments) {
  var options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: config.PYTHON_SHELL_ADI_SCRIPT_PATH
  }

  options.args = [totalPayments]
  python.run('adi.py', options, function (error, results) {
    if (error) {
      log.error(error)
    }
    log.info('Generated ADI Journal file, results: ' + results)
  })
}

execute('123.45')

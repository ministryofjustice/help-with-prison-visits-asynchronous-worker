const Promise = require('bluebird')
const python = require('python-shell')
const path = require('path')
const log = require('../log')
const config = require('../../../config')
const dateFormatter = require('../date-formatter')

module.exports = function (totalPayment) {
  const dataPath = config.DATA_FILE_PATH
  const outputPath = path.join(dataPath, config.PAYMENT_FILE_PATH)

  return new Promise(function (resolve, reject) {
    var options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: config.PYTHON_SHELL_ADI_SCRIPT_PATH
    }

    var filePath = path.join(outputPath, getFileName())

    var accountingDate = dateFormatter.now().format('DD MMM YYYY')

    options.args = [totalPayment, filePath, accountingDate]
    python.run('adi.py', options, function (error, results) {
      if (error) {
        log.error('Error calling python to generate ADI Journal')
        log.error(error)
        reject(error)
      }
      log.info('Generated ADI Journal file, results: ' + results)
      resolve(filePath)
    })
  })
}

function getFileName () {
  const datestamp = dateFormatter.now().format('YYYYMMDDHHmmss')
  return `apvs-adi-journal-${datestamp}.xlsm`
}

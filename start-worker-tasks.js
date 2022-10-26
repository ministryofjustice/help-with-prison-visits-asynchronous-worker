require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const processTasks = require('./app/process-tasks')

log.info('Started worker')

setTimeout(function () {
  processTasks()
    .then(function () {
      log.info('Worker completed processing tasks')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      }
    })
    .catch(function (error) {
      log.error('Failed processing tasks', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      }
    })
    .finally(() => {
      process.exit()
    })
}, 5000)

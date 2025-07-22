require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const processTasks = require('./app/process-tasks')

log.info('Started worker')

setTimeout(() => {
  processTasks()
    .then(() => {
      log.info('Worker completed processing tasks')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      } else {
        process.exit()
      }
    })
    .catch(error => {
      log.error('Failed processing tasks', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      } else {
        process.exit(1)
      }
    })
}, 5000)

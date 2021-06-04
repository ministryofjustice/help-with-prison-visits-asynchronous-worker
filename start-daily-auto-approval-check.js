require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const Promise = require('bluebird')
const insertTask = require('./app/services/data/insert-task')
const taskTypes = require('./app/constants/tasks-enum')

// This script inserts auto approval, according to a CRON config value (e.g. every morning at 5am)
log.info('Starting auto approval checks')
Promise.all([
  insertTask(null, null, null, taskTypes.AUTO_APPROVE_CLAIMS)])
  .then(function () {
    log.info('auto approval tasks created')
  })

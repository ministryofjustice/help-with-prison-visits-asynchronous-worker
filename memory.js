const memwatch = require('memwatch-next')
const logger = require('./app/services/log')

memwatch.on('leak', function (info) {
  logger.warn('MEMWATCH: Possible memory leak detected')
})

memwatch.on('stats', function (stats) {
  logger.trace({ memstats: stats })
})

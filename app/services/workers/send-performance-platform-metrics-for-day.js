const config = require('../../../config')
const log = require('../log')
const moment = require('moment')
const getNumberOfSubmittedClaimsForDateRange = require('../data/get-number-of-submitted-claims-for-date-range')
const sendPerformancePlatformMetricsForDay = require('../performance-platform/send-performance-platform-metrics-for-day')
const Promise = require('bluebird')

module.exports.execute = function (task) {
  log.info(`send-performance-platform-metrics-for-day PERFORMANCE_PLATFORM_SEND_ENABLED: ${config.PERFORMANCE_PLATFORM_SEND_ENABLED}`)

  if (config.PERFORMANCE_PLATFORM_SEND_ENABLED === 'true') {
    const dateCreated = task.dateCreated

    const startOfPreviousDayDateCreated = moment(dateCreated).startOf('day').subtract(1, 'days').toDate()
    const endOfPreviousDayDateCreated = moment(dateCreated).endOf('day').subtract(1, 'days').toDate()

    return getNumberOfSubmittedClaimsForDateRange(startOfPreviousDayDateCreated, endOfPreviousDayDateCreated)
      .then(function (submittedClaimCount) {
        log.info(`send-performance-platform-metrics-for-day - sending ${startOfPreviousDayDateCreated} count ${submittedClaimCount}`)
        return sendPerformancePlatformMetricsForDay(startOfPreviousDayDateCreated, submittedClaimCount)
      })
  } else {
    return Promise.resolve()
  }
}

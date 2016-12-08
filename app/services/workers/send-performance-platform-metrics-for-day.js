const config = require('../../../config')
const moment = require('moment')
const getNumberOfSubmittedClaimsForDateRange = require('../data/get-number-of-submitted-claims-for-date-range')
const postPerformancePlatformMetricsForDay = require('../performance-platform/post-performance-platform-metrics-for-day')
const Promise = require('bluebird')

module.exports.execute = function (task) {
  if (config.PERFORMANCE_PLATFORM_SEND_ENABLED === 'true') {
    var dateCreated = task.dateCreated

    var startOfPreviousDayDateCreated = moment(dateCreated).startOf('day').subtract(1, 'days').toDate()
    var endOfPreviousDayDateCreated = moment(dateCreated).endOf('day').subtract(1, 'days').toDate()

    return getNumberOfSubmittedClaimsForDateRange(startOfPreviousDayDateCreated, endOfPreviousDayDateCreated)
      .then(function (submittedClaimCount) {
        return postPerformancePlatformMetricsForDay(startOfPreviousDayDateCreated, submittedClaimCount)
      })
  } else {
    return Promise.resolve()
  }
}

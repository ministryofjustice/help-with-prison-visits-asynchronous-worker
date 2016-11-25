const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-visit-in-past'
const FAILURE_MESSAGE = 'The date of visit for this claim is not in the past at time of processing'

module.exports = function (autoApprovalData) {
  var now = moment()
  var dateOfVisit = moment(autoApprovalData.Claim.DateOfJourney)

  var checkPassed = dateOfVisit.isBefore(now)

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? FAILURE_MESSAGE : '')
}

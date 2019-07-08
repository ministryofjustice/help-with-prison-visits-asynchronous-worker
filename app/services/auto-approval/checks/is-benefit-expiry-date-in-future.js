const moment = require('moment')
const dateFormatter = require('../../date-formatter')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-benefit-expiry-date-in-future'
const FAILURE_MESSAGE = 'The date of visit for this claim is not in the past at time of processing'

module.exports = function (autoApprovalData) {
  var now = dateFormatter.now()
  var dateOfVisit = moment(autoApprovalData.Visitor.BenefitExpiryDate)

  var checkPassed = dateOfVisit.isAfter(now)

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
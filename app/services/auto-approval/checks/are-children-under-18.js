const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'are-children-under-18'
const FAILURE_MESSAGE = 'One or more children to be claimed are over 18 years old'

module.exports = function (autoApprovalData) {
  var now = moment()

  for (var i = 0; i < autoApprovalData.ClaimChildren.length; i++) {
    var child = autoApprovalData.ClaimChildren[i]
    var dateOfBirth = moment(child.DateOfBirth)
    var ageInYears = now.diff(dateOfBirth, 'years')

    if (ageInYears >= 18) {
      return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
    }
  }
  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}

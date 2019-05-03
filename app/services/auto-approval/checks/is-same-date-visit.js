const moment = require('moment')
const dateFormatter = require('../../date-formatter')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-same-date-visit'
const FAILURE_MESSAGE = 'Two or more claims submitted for the same prisoner on date'

module.exports = function (autoApprovalData) {
  var now = dateFormatter.now()

  if(autoApprovalData.Prisoner )

//  if (autoApprovalData.ClaimChildren && autoApprovalData.ClaimChildren.length > 0) {
//    for (var i = 0; i < autoApprovalData.ClaimChildren.length; i++) {
//      var child = autoApprovalData.ClaimChildren[i]
//      var dateOfBirth = moment(child.DateOfBirth)
//      var ageInYears = now.diff(dateOfBirth, 'years')
//
//      if (ageInYears >= 18) {
//        return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
//      }
//    }
//  }
//  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}

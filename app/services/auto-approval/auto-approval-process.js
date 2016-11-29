const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const autoApproveClaim = require('../data/auto-approve-claim')
const claimTypeEnum = require('../../constants/claim-type-enum')
const statusEnum = require('../../constants/status-enum')
const tasksEnum = require('../../constants/tasks-enum')
const insertTask = require('../data/insert-task')
const insertClaimEventData = require('../data/insert-claim-event-data')
const generateFailureReasonString = require('../notify/helpers/generate-failure-reason-string')
const autoApprovalDataConstructor = require('./auto-approval-data-constructor')

const autoApprovalChecks = [
  require('./checks/are-children-under-18'),
  require('./checks/cost-and-variance-equal-or-less-than-first-time-claim'),
  require('./checks/do-expenses-match-first-time-claim'),
  require('./checks/has-claimed-less-than-max-times-this-year'),
  require('./checks/has-uploaded-prison-visit-confirmation-and-receipts'),
  require('./checks/is-claim-submitted-within-time-limit'),
  require('./checks/is-claim-total-under-limit'),
  require('./checks/is-latest-manual-claim-approved'),
  require('./checks/is-no-previous-pending-claim'),
  require('./checks/is-prison-not-in-guernsey-jersey'),
  require('./checks/is-visit-in-past'),
  require('./checks/visit-date-different-to-previous-claims')
]

module.exports = function (claimData) {
  var result = {
    claimApproved: true,
    checks: []
  }

  // Fail auto-approval check if First time claim or status is PENDING
  if (claimData.Claim.ClaimType === claimTypeEnum.FIRST_TIME ||
    claimData.Claim.Status === statusEnum.PENDING) {
    result.claimApproved = false
    return Promise.resolve(result)
  }

  return getDataForAutoApprovalChecks(claimData)
    .then(function (autoApprovalData) {
      // Short-circuit checks if there are no previously approved claims for the claimant
      if (!claimData.latestManuallyApprovedClaim) {
        result.claimApproved = false
        return result
      }

      var claimAndAutoApprovalData = autoApprovalDataConstructor(claimData, autoApprovalData)

      autoApprovalChecks.forEach(function (check) {
        var checkResult = check(claimAndAutoApprovalData)
        if (!checkResult.result) {
          result.claimApproved = false
        }
        result.checks.push(checkResult)
      })

      result.claimApproved = true
      // Loop through result properties, if any are false, then the claim should not be approved
      result.checks.forEach(function (check) {
        if (!check.result) {
          result.claimApproved = false
        }
      })

      if (result.claimApproved) {
        return autoApproveClaim(claimAndAutoApprovalData.Claim)
          .then(function () {
            return result
          })
      } else {
        return insertClaimEventData(claimAndAutoApprovalData.Claim, 'AUTO-APPROVAL-FAILURE', null, generateFailureReasonString(result.checks), true)
          .then(function () {
            return result
          })
      }
    })
}

const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const autoApproveClaim = require('../data/auto-approve-claim')
const statusEnum = require('../../constants/status-enum')
const tasksEnum = require('../../constants/tasks-enum')
const insertTask = require('../data/insert-task')

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
  var result = {checks: []}

  // Fail auto-approval check if status has been set to Pending in the copy-claim-data-to-internal module
  if (claimData.Claim.Status === statusEnum.PENDING) {
    result.claimApproved = false
    return Promise.resolve(result)
  }

  return getDataForAutoApprovalChecks(claimData.Claim)
    .then(function (autoApprovalData) {
      for (var check in autoApprovalChecks) {
        var checkResult = autoApprovalChecks[check](autoApprovalData)
        result.checks.push(checkResult)
      }

      result.claimApproved = true
      // Loop through result properties, if any are false, then the claim should not be approved
      result.checks.forEach(function (check) {
        if (!check.result) {
          result.claimApproved = false
        }
      })

      if (result.claimApproved) {
        return autoApproveClaim(claimData.Claim.ClaimId)
          .then(function () {
            return insertTask(claimData.Claim.Reference, claimData.Claim.EligibilityId, claimData.Claim.ClaimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
          })
          .then(function () {
            return result
          })
      } else {
        return result
      }
    })
}

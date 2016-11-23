const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const statusEnum = require('../../constants/status-enum')

const autoApprovalChecks = [
  require('./checks/is-latest-manual-claim-approved'),
  require('./checks/is-no-previous-pending-claim')
]

module.exports = function (claimData) {
  var result = {checks: []}

  return getDataForAutoApprovalChecks(claimData.Claim.Reference,
    claimData.Claim.EligibilityId,
    claimData.Claim.ClaimId,
    statusEnum.SUBMITTED
  )
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

      // TODO - update status to indicate auto-approval
      return result
    })
}

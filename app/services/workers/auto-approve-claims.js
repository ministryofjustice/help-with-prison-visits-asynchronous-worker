const getAutoApproveClaims = require('../data/get-auto-approve-claim')
const autoApproveClaim = require('../data/auto-approve-claim')
const deleteAutoApproveClaim = require('../data/delete-auto-approve-claim')
const log = require('../log')

module.exports.execute = function (task) {
  var claimData

  return getAutoApproveClaims()
    .then(function (data) { claimData = data })
    .then(function () {
      claimData.forEach(function (claim) {
        log.info(claim)
        return autoApproveClaim(claim.Reference, claim.EligibilityId, claim.ClaimId, claim.EmailAddress)
          .then(function () {
            log.info(claim.AutoApprovalId)
            return deleteAutoApproveClaim(claim.AutoApprovalId)
          })
      })
    })
}

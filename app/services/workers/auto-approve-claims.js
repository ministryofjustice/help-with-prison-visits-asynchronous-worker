const getAutoApproveClaims = require('../data/get-auto-approve-claim')
const autoApproveClaim = require('../data/auto-approve-claim')
const deleteAutoApproveClaim = require('../data/delete-auto-approve-claim')

const autoApproveClaims = function () {
  log.info('Starting auto approve claims')
  let claimData

  return getAutoApproveClaims()
    .then(function (data) {
      claimData = data
      claimData.forEach(function (claim) {
        return autoApproveClaim(claim.Reference, claim.EligibilityId, claim.ClaimId, claim.EmailAddress)
          .then(function () {
            return deleteAutoApproveClaim(claim.AutoApprovalId)
          })
      })
    })
}

module.exports = {
  autoApproveClaims
}
